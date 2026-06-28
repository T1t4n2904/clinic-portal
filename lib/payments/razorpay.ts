import { prisma } from "@/lib/prisma";

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

export async function createRazorpayOrder(appointmentId: string, amount: number) {
  if (!keyId || !keySecret) {
    console.warn("Razorpay credentials missing. Unable to create real order.");
    return null;
  }

  // In production:
  // const response = await fetch("https://api.razorpay.com/v1/orders", {
  //   method: "POST",
  //   headers: {
  //     "Content-Type": "application/json",
  //     Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`,
  //   },
  //   body: JSON.stringify({
  //     amount: amount * 100, // Razorpay works in paise
  //     currency: "INR",
  //     receipt: appointmentId,
  //   }),
  // });
  // const order = await response.json();

  const mockOrderId = `order_${Math.random().toString(36).substring(7)}`;

  const payment = await prisma.payment.create({
    data: {
      appointmentId,
      provider: "RAZORPAY",
      amount,
      currency: "INR",
      status: "PENDING",
      providerOrderId: mockOrderId,
    },
  });

  return payment;
}

export function isRazorpayConfigured(): boolean {
  return Boolean(keyId && keySecret);
}
