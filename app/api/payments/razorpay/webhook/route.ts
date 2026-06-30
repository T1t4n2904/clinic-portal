import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { sendClinicNotification } from "@/lib/notifications/service";

export async function POST(req: Request) {
  try {
    const bodyText = await req.text();
    const signature = req.headers.get("x-razorpay-signature") || "";
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (webhookSecret) {
      const expectedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(bodyText)
        .digest("hex");

      if (expectedSignature !== signature) {
        return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
      }
    } else {
      console.warn("RAZORPAY_WEBHOOK_SECRET is missing. Bypassing signature check for development.");
    }

    const payload = JSON.parse(bodyText);
    const event = payload.event;

    if (event === "payment.captured" || event === "order.paid") {
      const orderId = payload.payload?.payment?.entity?.order_id || payload.payload?.order?.entity?.id;
      const paymentId = payload.payload?.payment?.entity?.id;

      if (orderId && paymentId) {
        const payment = await prisma.payment.findFirst({
          where: { providerOrderId: orderId },
        });

        if (payment && payment.status !== "PAID") {
          const appointment = await prisma.appointment.findUnique({
            where: { id: payment.appointmentId },
            include: { patient: true },
          });

          if (appointment) {
            await prisma.$transaction([
              prisma.payment.update({
                where: { id: payment.id },
                data: { status: "PAID", providerPaymentId: paymentId },
              }),
              prisma.appointment.update({
                where: { id: payment.appointmentId },
                data: { paymentStatus: "PAID", status: "CONFIRMED" },
              }),
            ]);

            await sendClinicNotification({
              userId: appointment.patient.id,
              appointmentId: appointment.id,
              type: "APPOINTMENT_CONFIRMED",
              recipient: appointment.patient.phone,
              message: `Namaste ${appointment.patient.fullName}, your appointment is confirmed for ${appointment.slotLabel}. Please open the clinic portal for details.`,
            });

            const doctorPhone = process.env.DOCTOR_WHATSAPP_NUMBER;
            if (doctorPhone) {
              await sendClinicNotification({
                appointmentId: appointment.id,
                type: "APPOINTMENT_CONFIRMED",
                recipient: doctorPhone.replace(/['"]/g, "").trim(),
                message: `New appointment confirmed with ${appointment.patient.fullName} for ${appointment.slotLabel}. Mode: ${appointment.mode}. Open the doctor portal to view details.`,
              });
            }
          }
        }
      }
    }

    return NextResponse.json({ received: true, event });
  } catch (error: any) {
    console.error("Razorpay webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed", details: error.message },
      { status: 500 }
    );
  }
}
