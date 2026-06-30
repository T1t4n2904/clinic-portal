import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";
import { sendClinicNotification } from "@/lib/notifications/service";

export async function POST(req: Request) {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { appointmentId, paymentId, orderId, signature } = await req.json();

    if (!appointmentId || !paymentId || !orderId || !signature) {
      return new Response("Missing required verification parameters", { status: 400 });
    }

    const rawKeySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!rawKeySecret) {
      return new Response("Razorpay key secret not configured", { status: 500 });
    }
    const keySecret = rawKeySecret.replace(/['"]/g, "").trim();

    // 1. Verify checkout response signature using native crypto hmac
    const text = `${orderId}|${paymentId}`;
    const generatedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(text)
      .digest("hex");

    if (generatedSignature !== signature) {
      return new Response("Invalid signature match", { status: 400 });
    }

    // 2. Query appointment and patient info
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { patient: true },
    });

    if (!appointment) {
      return new Response("Appointment record not found", { status: 404 });
    }

    // 3. Update database in transaction
    await prisma.$transaction([
      prisma.payment.updateMany({
        where: { providerOrderId: orderId },
        data: {
          status: "PAID",
          providerPaymentId: paymentId,
        },
      }),
      prisma.appointment.update({
        where: { id: appointmentId },
        data: {
          paymentStatus: "PAID",
          status: "CONFIRMED",
        },
      }),
    ]);

    // 4. Send booking confirmation notifications
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

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Razorpay verification endpoint error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
