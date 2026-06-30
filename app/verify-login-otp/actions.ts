"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/session";
import { isOtpExpired, verifyOtp } from "@/lib/otp";
import { isTwilioVerifyConfigured, checkVerificationOtp } from "@/lib/twilio-verify";

export type VerifyLoginOtpActionState = {
  message?: string;
};

export async function verifyLoginOtp(
  _prevState: VerifyLoginOtpActionState,
  formData: FormData
): Promise<VerifyLoginOtpActionState> {
  const challenge = String(formData.get("challenge") || "").trim();
  const otp = String(formData.get("otp") || "").trim();

  if (!challenge) {
    return { message: "Login OTP challenge is missing. Please login again." };
  }

  if (!/^\d{6}$/.test(otp)) {
    return { message: "Enter a valid 6-digit OTP." };
  }

  if (isTwilioVerifyConfigured() && challenge.startsWith("twilio_")) {
    const phone = challenge.replace("twilio_", "");
    const checkResult = await checkVerificationOtp(phone, otp);

    if (!checkResult.success) {
      return { message: checkResult.error || "Invalid or expired login OTP. Please try again." };
    }

    const user = await prisma.user.findFirst({
      where: {
        phone,
        role: "PATIENT",
      },
      select: {
        id: true,
      },
    });

    if (!user) {
      return { message: "Patient account not found. Please try again." };
    }

    await createSession(user.id);
    redirect("/dashboard");
  }

  // Fallback to existing demo OTP flow
  const loginOtp = await prisma.otpCode.findUnique({
    where: { id: challenge },
    include: {
      user: {
        select: {
          id: true,
          role: true,
          phoneVerified: true,
        },
      },
    },
  });

  if (
    !loginOtp ||
    loginOtp.purpose !== "LOGIN_VERIFY" ||
    loginOtp.consumed ||
    !loginOtp.user.phoneVerified
  ) {
    return { message: "Invalid login OTP. Please login again." };
  }

  if (isOtpExpired(loginOtp.expiresAt)) {
    return { message: "Login OTP expired. Please login again." };
  }

  const isValid = await verifyOtp(otp, loginOtp.otpHash);

  if (!isValid) {
    return { message: "Invalid login OTP." };
  }

  await prisma.otpCode.update({
    where: { id: loginOtp.id },
    data: { consumed: true },
  });

  await createSession(loginOtp.user.id);

  if (loginOtp.user.role === "DOCTOR") {
    redirect("/doctor/dashboard");
  }

  redirect("/dashboard");
}
