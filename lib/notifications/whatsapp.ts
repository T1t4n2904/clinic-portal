import { prisma } from "@/lib/prisma";
import type { NotificationType } from "@prisma/client";

const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

export async function sendWhatsAppNotification(params: {
  userId?: string;
  appointmentId?: string;
  type: NotificationType;
  recipient: string;
  message: string;
}) {
  if (!accessToken || !phoneNumberId) {
    console.warn("WhatsApp credentials missing. Falling back to Demo log.");
    
    // Create a FAILED log detailing config error
    return prisma.notificationLog.create({
      data: {
        userId: params.userId || null,
        appointmentId: params.appointmentId || null,
        channel: "WHATSAPP",
        type: params.type,
        recipient: params.recipient,
        message: params.message,
        status: "FAILED",
        error: "WhatsApp configuration missing (WHATSAPP_ACCESS_TOKEN or WHATSAPP_PHONE_NUMBER_ID)",
      },
    });
  }

  // In production:
  // const response = await fetch(`https://graph.facebook.com/v20.0/${phoneNumberId}/messages`, {
  //   method: "POST",
  //   headers: {
  //     "Content-Type": "application/json",
  //     Authorization: `Bearer ${accessToken}`,
  //   },
  //   body: JSON.stringify({
  //     messaging_product: "whatsapp",
  //     to: params.recipient,
  //     type: "template",
  //     template: {
  //       name: "appointment_confirmation",
  //       language: { code: "en_US" },
  //     },
  //   }),
  // });
  // const data = await response.json();

  const mockMessageId = `wa_msg_${Math.random().toString(36).substring(7)}`;

  const log = await prisma.notificationLog.create({
    data: {
      userId: params.userId || null,
      appointmentId: params.appointmentId || null,
      channel: "WHATSAPP",
      type: params.type,
      recipient: params.recipient,
      message: params.message,
      status: "SENT",
      providerMessageId: mockMessageId,
    },
  });

  return log;
}

export function isWhatsAppConfigured(): boolean {
  return Boolean(accessToken && phoneNumberId);
}
