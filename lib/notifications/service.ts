import { prisma } from "@/lib/prisma";
import type { NotificationType } from "@prisma/client";
import { sendTwilioWhatsApp, isTwilioConfigured } from "./twilio";

export type ClinicNotificationParams = {
  userId?: string;
  appointmentId?: string;
  recipient: string;
  type: NotificationType;
  message: string;
};

export async function sendClinicNotification(params: ClinicNotificationParams, forceResend = false) {
  // 1. Prevent duplicate notifications of the same type for the same appointment AND recipient (unless forceResend is true)
  if (!forceResend && params.appointmentId) {
    const existingSent = await prisma.notificationLog.findFirst({
      where: {
        appointmentId: params.appointmentId,
        type: params.type,
        recipient: params.recipient,
        status: "SENT",
      },
    });

    if (existingSent) {
      console.log(
        `[NOTIFICATION BYPASSED] Already sent notification of type ${params.type} to recipient ${params.recipient} for appointment ${params.appointmentId}`
      );
      return existingSent;
    }
  }

  // 2. Determine active channel based on configuration
  const isConfigured = isTwilioConfigured();
  const channel = isConfigured ? "WHATSAPP" : "DEMO";

  // 3. Create base log entry in PENDING state
  const log = await prisma.notificationLog.create({
    data: {
      userId: params.userId || null,
      appointmentId: params.appointmentId || null,
      channel,
      type: params.type,
      recipient: params.recipient,
      message: params.message,
      status: "PENDING",
    },
  });

  // 4. Dispatch based on configuration
  if (isConfigured) {
    try {
      const result = await sendTwilioWhatsApp(params, log.id);
      return result;
    } catch (err: any) {
      console.error("Twilio dispatcher critical failure:", err);
      return prisma.notificationLog.update({
        where: { id: log.id },
        data: {
          status: "FAILED",
          error: err.message || String(err),
        },
      });
    }
  } else {
    // Graceful fallback to DEMO log in SENT state
    console.log(
      `[DEMO NOTIFICATION LOGGED] Recipient: ${params.recipient} | Type: ${params.type} | Message: ${params.message}`
    );
    return prisma.notificationLog.update({
      where: { id: log.id },
      data: {
        status: "SENT",
      },
    });
  }
}
