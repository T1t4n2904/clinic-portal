import { NextResponse } from "next/server";

// GET request: verification challenge from Meta/WhatsApp APIs
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get("hub.mode");
    const token = searchParams.get("hub.verify_token");
    const challenge = searchParams.get("hub.challenge");
    const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;

    if (mode === "subscribe" && token) {
      // Allow bypass/fallback verification if token is not defined in env for development
      if (!verifyToken || token === verifyToken) {
        console.log("WhatsApp webhook challenge verified.");
        return new Response(challenge, { status: 200 });
      }
      return new Response("Forbidden: invalid verification token", { status: 403 });
    }
    return new Response("Bad Request", { status: 400 });
  } catch (error: any) {
    return new Response(error.message, { status: 500 });
  }
}

// POST request: receive notification logs / payload messages
export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // TODO: Verify payload authenticity, parse delivery statuses or user replies
    console.log("Received WhatsApp webhook event payload:", JSON.stringify(body, null, 2));

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("WhatsApp webhook event error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed", details: error.message },
      { status: 500 }
    );
  }
}
