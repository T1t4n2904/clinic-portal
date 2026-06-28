import { prisma } from "@/lib/prisma";

export async function processDemoPayment(appointmentId: string, amount: number) {
  // Create a Payment record in database with status PAID
  const payment = await prisma.payment.create({
    data: {
      appointmentId,
      provider: "DEMO",
      amount,
      currency: "INR",
      status: "PAID",
    },
  });

  // Update appointment payment status and operational status
  await prisma.appointment.update({
    where: { id: appointmentId },
    data: {
      paymentStatus: "PAID",
      status: "CONFIRMED",
    },
  });

  return payment;
}
