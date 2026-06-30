"use server";

import * as bcrypt from "bcrypt";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { generateOtp, getOtpExpiry, hashOtp } from "@/lib/otp";

export type LoginActionState = {
  errors?: Record<string, string>;
  message?: string;
};

export async function loginPatient(
  _prevState: LoginActionState,
  formData: FormData
): Promise<LoginActionState> {
  const identifier = String(formData.get("identifier") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  if (!identifier || !password) {
    return {
      errors: {
        ...(!identifier ? { identifier: "Enter your email or phone number." } : {}),
        ...(!password ? { password: "Enter your password." } : {}),
      },
    };
  }

  const user = await prisma.user.findFirst({
    where: {
      OR: [{ email: identifier }, { phone: identifier }],
    },
    select: {
      id: true,
      phone: true,
      passwordHash: true,
      role: true,
      phoneVerified: true,
    },
  });

  if (!user) {
    return { errors: { identifier: "No patient account found for these details." } };
  }

  if (user.role !== "PATIENT") {
    return { errors: { identifier: "Use the correct login page for this account." } };
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

  if (!isPasswordValid) {
    return { errors: { password: "Incorrect password." } };
  }

  if (!user.phoneVerified) {
    const { isTwilioVerifyConfigured, sendVerificationOtp } = await import("@/lib/twilio-verify");

    if (isTwilioVerifyConfigured()) {
      const otpResult = await sendVerificationOtp(user.phone);
      if (!otpResult.success) {
        return { errors: { identifier: otpResult.error || "Failed to send WhatsApp verification OTP code." } };
      }
      redirect(`/verify-otp?phone=${user.phone}`);
    } else {
      await prisma.otpCode.updateMany({
        where: {
          userId: user.id,
          purpose: "PHONE_VERIFICATION",
          consumed: false,
        },
        data: { consumed: true },
      });

      const otp = generateOtp();
      await prisma.otpCode.create({
        data: {
          phone: user.phone,
          otpHash: await hashOtp(otp),
          purpose: "PHONE_VERIFICATION",
          expiresAt: getOtpExpiry(5),
          userId: user.id,
        },
      });

      console.log("DEV REGISTRATION OTP FOR UNVERIFIED LOGIN:", otp);
      redirect(`/verify-otp?phone=${user.phone}&devOtp=${otp}`);
    }
  }

  const { isTwilioVerifyConfigured, sendVerificationOtp } = await import("@/lib/twilio-verify");

  if (isTwilioVerifyConfigured()) {
    const otpResult = await sendVerificationOtp(user.phone);
    if (!otpResult.success) {
      return { errors: { identifier: otpResult.error || "Failed to send WhatsApp verification OTP code via Twilio Verify." } };
    }
    redirect(`/verify-login-otp?challenge=twilio_${user.phone}`);
  }

  // Fallback to existing demo OTP flow
  await prisma.otpCode.updateMany({
    where: {
      userId: user.id,
      purpose: "LOGIN_VERIFY",
      consumed: false,
    },
    data: { consumed: true },
  });

  const otp = generateOtp();
  const loginOtp = await prisma.otpCode.create({
    data: {
      phone: user.phone,
      otpHash: await hashOtp(otp),
      purpose: "LOGIN_VERIFY",
      expiresAt: getOtpExpiry(5),
      userId: user.id,
    },
  });

  console.log("DEV LOGIN OTP:", otp);

  redirect(`/verify-login-otp?challenge=${loginOtp.id}&devOtp=${otp}`);
}
