import { prisma } from "@/lib/prisma";
import type { NotificationType } from "@prisma/client";

export async function sendDemoNotification(params: {
  userId?: string;
  appointmentId?: string;
  type: NotificationType;
  recipient: string;
  message: string;
}) {
  // Log a demo notification record into database with status SENT
  const log = await prisma.notificationLog.create({
    data: {
      userId: params.userId || null,
      appointmentId: params.appointmentId || null,
      channel: "DEMO",
      type: params.type,
      recipient: params.recipient,
      message: params.message,
      status: "SENT",
    },
  });

  console.log(
    `[DEMO NOTIFICATION LOGGED] Recipient: ${params.recipient} | Type: ${params.type} | Message: ${params.message}`
  );

  return log;
}
