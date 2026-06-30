import { prisma } from "@/lib/prisma";
import type { NotificationType } from "@prisma/client";

export function normalizeTwilioPhone(phone: string): string {
  const trimmed = phone.trim();
  if (trimmed.startsWith("whatsapp:")) {
    return trimmed;
  }
  let clean = trimmed.replace(/\D/g, "");
  // If it starts with 91 and has 12 digits
  if (clean.length === 12 && clean.startsWith("91")) {
    return `whatsapp:+${clean}`;
  }
  // If it has 10 digits
  if (clean.length === 10) {
    return `whatsapp:+91${clean}`;
  }
  // Fallback E.164
  return `whatsapp:+${clean}`;
}

export function isTwilioConfigured(): boolean {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_WHATSAPP_NUMBER || process.env.TWILIO_PHONE_NUMBER;
  return Boolean(sid && token && from);
}

export async function sendTwilioWhatsApp(
  params: {
    userId?: string;
    appointmentId?: string;
    type: NotificationType;
    recipient: string;
    message: string;
  },
  existingLogId?: string
) {
  const rawSid = process.env.TWILIO_ACCOUNT_SID;
  const rawToken = process.env.TWILIO_AUTH_TOKEN;
  const rawFrom = process.env.TWILIO_WHATSAPP_NUMBER || process.env.TWILIO_PHONE_NUMBER;

  if (!rawSid || !rawToken || !rawFrom) {
    const errMsg = "Twilio WhatsApp configuration missing";
    if (existingLogId) {
      return prisma.notificationLog.update({
        where: { id: existingLogId },
        data: { status: "FAILED", error: errMsg },
      });
    }
    return prisma.notificationLog.create({
      data: {
        userId: params.userId || null,
        appointmentId: params.appointmentId || null,
        channel: "WHATSAPP",
        type: params.type,
        recipient: params.recipient,
        message: params.message,
        status: "FAILED",
        error: errMsg,
      },
    });
  }

  const accountSid = rawSid.replace(/['"]/g, "").trim();
  const authToken = rawToken.replace(/['"]/g, "").trim();
  const fromPhone = rawFrom.replace(/['"]/g, "").trim();

  const cleanFrom = fromPhone.startsWith("whatsapp:") ? fromPhone : `whatsapp:${fromPhone}`;
  const toPhone = normalizeTwilioPhone(params.recipient);

  const basicAuth = Buffer.from(`${accountSid}:${authToken}`).toString("base64");

  try {
    const bodyParams = new URLSearchParams();
    bodyParams.append("To", toPhone);
    bodyParams.append("From", cleanFrom);
    bodyParams.append("Body", params.message);

    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${basicAuth}`,
      },
      body: bodyParams.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      const errMsg = `Twilio API Error (${response.status}): ${errorText}`;
      if (existingLogId) {
        return prisma.notificationLog.update({
          where: { id: existingLogId },
          data: { status: "FAILED", error: errMsg },
        });
      }
      return prisma.notificationLog.create({
        data: {
          userId: params.userId || null,
          appointmentId: params.appointmentId || null,
          channel: "WHATSAPP",
          type: params.type,
          recipient: params.recipient,
          message: params.message,
          status: "FAILED",
          error: errMsg,
        },
      });
    }

    const data = await response.json();
    const messageId = data.sid || `tw_msg_${Math.random().toString(36).substring(7)}`;

    if (existingLogId) {
      return prisma.notificationLog.update({
        where: { id: existingLogId },
        data: { status: "SENT", providerMessageId: messageId },
      });
    }

    return prisma.notificationLog.create({
      data: {
        userId: params.userId || null,
        appointmentId: params.appointmentId || null,
        channel: "WHATSAPP",
        type: params.type,
        recipient: params.recipient,
        message: params.message,
        status: "SENT",
        providerMessageId: messageId,
      },
    });
  } catch (err: any) {
    const errMsg = err.message || String(err);
    if (existingLogId) {
      return prisma.notificationLog.update({
        where: { id: existingLogId },
        data: { status: "FAILED", error: errMsg },
      });
    }
    return prisma.notificationLog.create({
      data: {
        userId: params.userId || null,
        appointmentId: params.appointmentId || null,
        channel: "WHATSAPP",
        type: params.type,
        recipient: params.recipient,
        message: params.message,
        status: "FAILED",
        error: errMsg,
      },
    });
  }
}
