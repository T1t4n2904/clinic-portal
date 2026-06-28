import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const bodyText = await req.text();
    const signature = req.headers.get("x-razorpay-signature") || "";
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    // TODO: Verify signature only if the secret is configured
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

    // TODO: Parse payment details and update the Payment + Appointment records in transaction
    // Example logic skeleton:
    // if (event === "payment.captured" || event === "order.paid") {
    //   const orderId = payload.payload?.payment?.entity?.order_id || payload.payload?.order?.entity?.id;
    //   const paymentId = payload.payload?.payment?.entity?.id;
    //   const payment = await prisma.payment.findFirst({ where: { providerOrderId: orderId } });
    //   if (payment) {
    //     await prisma.$transaction([
    //       prisma.payment.update({
    //         where: { id: payment.id },
    //         data: { status: "PAID", providerPaymentId: paymentId },
    //       }),
    //       prisma.appointment.update({
    //         where: { id: payment.appointmentId },
    //         data: { paymentStatus: "PAID", status: "CONFIRMED" },
    //       }),
    //     ]);
    //   }
    // }

    return NextResponse.json({ received: true, event });
  } catch (error: any) {
    console.error("Razorpay webhook error:", error);
    // Not crashing and returning a safe JSON response if something goes wrong
    return NextResponse.json(
      { error: "Webhook processing failed", details: error.message },
      { status: 500 }
    );
  }
}
