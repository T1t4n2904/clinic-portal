import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";

export async function POST(req: Request) {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.role !== "PATIENT") {
      return new Response("Forbidden", { status: 403 });
    }

    const { appointmentId } = await req.json();
    if (!appointmentId) {
      return new Response("appointmentId is required", { status: 400 });
    }

    const appointment = await prisma.appointment.findFirst({
      where: {
        id: appointmentId,
        patientId: user.id,
        paymentStatus: "PENDING",
      },
    });

    if (!appointment) {
      return new Response("Appointment not found or already paid", { status: 404 });
    }

    const rawKeyId = process.env.RAZORPAY_KEY_ID;
    const rawKeySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!rawKeyId || !rawKeySecret) {
      return new Response("Razorpay credentials not configured", { status: 500 });
    }

    const keyId = rawKeyId.replace(/['"]/g, "").trim();
    const keySecret = rawKeySecret.replace(/['"]/g, "").trim();

    const basicAuth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
    const amountInPaise = appointment.amount * 100;

    const rpResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${basicAuth}`,
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency: "INR",
        receipt: appointment.id,
      }),
    });

    if (!rpResponse.ok) {
      const errorText = await rpResponse.text();
      console.error("Razorpay API order creation failed:", errorText);
      return new Response(`Razorpay API order creation failed: ${errorText}`, { status: 500 });
    }

    const orderData = await rpResponse.json();
    const orderId = orderData.id;

    // Create payment entry in PENDING state linked to Razorpay provider order
    await prisma.payment.create({
      data: {
        appointmentId: appointment.id,
        provider: "RAZORPAY",
        providerOrderId: orderId,
        amount: appointment.amount,
        status: "PENDING",
      },
    });

    return NextResponse.json({
      orderId,
      amount: appointment.amount,
      keyId,
      patientName: user.fullName,
      patientPhone: user.phone,
      patientEmail: user.email,
    });
  } catch (error: any) {
    console.error("Razorpay order creation endpoint error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
