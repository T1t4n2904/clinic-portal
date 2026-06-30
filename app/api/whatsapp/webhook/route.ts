import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET request: verification challenge from Meta/WhatsApp APIs using WHATSAPP_VERIFY_TOKEN
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get("hub.mode");
    const token = searchParams.get("hub.verify_token");
    const challenge = searchParams.get("hub.challenge");

    const rawVerifyToken = process.env.WHATSAPP_VERIFY_TOKEN;
    const verifyToken = rawVerifyToken ? rawVerifyToken.replace(/['"]/g, "").trim() : "";

    if (mode === "subscribe" && token === verifyToken) {
      console.log("WhatsApp webhook challenge verified.");
      return new Response(challenge || "", { status: 200 });
    }
    return new Response("Forbidden: invalid verification token", { status: 403 });
  } catch (error: any) {
    return new Response(error.message || "Internal Server Error", { status: 500 });
  }
}

// POST request: receive notification logs / status updates
export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Received WhatsApp webhook event:", JSON.stringify(body, null, 2));

    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;

    if (value?.statuses && Array.isArray(value.statuses)) {
      for (const statusObj of value.statuses) {
        const messageId = statusObj.id;
        const status = statusObj.status; // e.g. "sent", "delivered", "read", "failed"
        const errors = statusObj.errors;

        if (messageId) {
          const log = await prisma.notificationLog.findFirst({
            where: { providerMessageId: messageId },
          });

          if (log) {
            let logStatus = log.status;
            if (status === "failed") {
              logStatus = "FAILED";
            }

            await prisma.notificationLog.update({
              where: { id: log.id },
              data: {
                status: logStatus,
                error: errors ? JSON.stringify(errors) : log.error,
              },
            });
            console.log(`Updated notification status for message ${messageId} to ${status}`);
          }
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("WhatsApp webhook event processing error:", error);
    // Return 200 so Meta webhook verification does not retry repeatedly due to a processing logic warning
    return NextResponse.json(
      { error: "Webhook handled with warning", details: error.message },
      { status: 200 }
    );
  }
}
