export function normalizeVerifyPhone(phone: string): string {
  const trimmed = phone.trim();
  if (trimmed.startsWith("+")) {
    return trimmed;
  }
  const digitsOnly = trimmed.replace(/\D/g, "");
  if (digitsOnly.length === 10) {
    return `+91${digitsOnly}`;
  }
  if (digitsOnly.length === 12 && digitsOnly.startsWith("91")) {
    return `+${digitsOnly}`;
  }
  return `+${digitsOnly}`;
}

export function isTwilioVerifyConfigured(): boolean {
  return false;
}

export async function sendVerificationOtp(phone: string): Promise<{ success: boolean; error?: string }> {
  const rawSid = process.env.TWILIO_ACCOUNT_SID;
  const rawToken = process.env.TWILIO_AUTH_TOKEN;
  const rawServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

  if (!rawSid || !rawToken || !rawServiceSid) {
    return { success: false, error: "Twilio Verify configurations are missing." };
  }

  const accountSid = rawSid.replace(/['"]/g, "").trim();
  const authToken = rawToken.replace(/['"]/g, "").trim();
  const serviceSid = rawServiceSid.replace(/['"]/g, "").trim();

  const toPhone = normalizeVerifyPhone(phone);
  const basicAuth = Buffer.from(`${accountSid}:${authToken}`).toString("base64");

  try {
    const params = new URLSearchParams();
    params.append("To", toPhone);
    params.append("Channel", "whatsapp");

    const response = await fetch(`https://verify.twilio.com/v2/Services/${serviceSid}/Verifications`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${basicAuth}`,
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return { success: false, error: `Twilio Verify Send Error (${response.status}): ${errorText}` };
    }

    const data = await response.json();
    return { success: data.status === "pending" };
  } catch (err: any) {
    return { success: false, error: err.message || String(err) };
  }
}

export async function checkVerificationOtp(phone: string, code: string): Promise<{ success: boolean; error?: string }> {
  const rawSid = process.env.TWILIO_ACCOUNT_SID;
  const rawToken = process.env.TWILIO_AUTH_TOKEN;
  const rawServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

  if (!rawSid || !rawToken || !rawServiceSid) {
    return { success: false, error: "Twilio Verify configurations are missing." };
  }

  const accountSid = rawSid.replace(/['"]/g, "").trim();
  const authToken = rawToken.replace(/['"]/g, "").trim();
  const serviceSid = rawServiceSid.replace(/['"]/g, "").trim();

  const toPhone = normalizeVerifyPhone(phone);
  const basicAuth = Buffer.from(`${accountSid}:${authToken}`).toString("base64");

  try {
    const params = new URLSearchParams();
    params.append("To", toPhone);
    params.append("Code", code.trim());

    const response = await fetch(`https://verify.twilio.com/v2/Services/${serviceSid}/VerificationCheck`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${basicAuth}`,
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return { success: false, error: `Twilio Verify Check Error (${response.status}): ${errorText}` };
    }

    const data = await response.json();
    return { success: data.status === "approved" };
  } catch (err: any) {
    return { success: false, error: err.message || String(err) };
  }
}
export const dynamic = "force-dynamic";
