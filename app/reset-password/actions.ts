"use server";

import * as bcrypt from "bcrypt";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isOtpExpired, verifyOtp } from "@/lib/otp";

export type ResetPasswordActionState = {
  errors?: Record<string, string>;
  message?: string;
};

export async function resetPassword(
  _prevState: ResetPasswordActionState,
  formData: FormData
): Promise<ResetPasswordActionState> {
  const identifier = String(formData.get("identifier") || "").trim().toLowerCase();
  const otp = String(formData.get("otp") || "").trim();
  const password = String(formData.get("password") || "");
  const confirmPassword = String(formData.get("confirmPassword") || "");
  const errors: Record<string, string> = {};

  if (!identifier) {
    errors.identifier = "Enter your registered email or phone number.";
  }

  if (!/^\d{6}$/.test(otp)) {
    errors.otp = "Enter a valid 6-digit OTP.";
  }

  if (password.length < 8) {
    errors.password = "Password must be at least 8 characters.";
  }

  if (password !== confirmPassword) {
    errors.confirmPassword = "Passwords do not match.";
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  const user = await prisma.user.findFirst({
    where: {
      role: "PATIENT",
      OR: [{ email: identifier }, { phone: identifier }],
    },
  });

  if (!user) {
    return { errors: { identifier: "No patient account found for these details." } };
  }

  const { isTwilioVerifyConfigured, checkVerificationOtp } = await import("@/lib/twilio-verify");

  if (isTwilioVerifyConfigured()) {
    const checkResult = await checkVerificationOtp(user.phone, otp);
    if (!checkResult.success) {
      return { errors: { otp: checkResult.error || "Invalid or expired reset OTP." } };
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: await bcrypt.hash(password, 10),
      },
    });

    redirect("/login?reset=1");
  }

  // Fallback to existing demo OTP flow
  const latestOtp = await prisma.otpCode.findFirst({
    where: {
      userId: user.id,
      purpose: "PASSWORD_RESET",
      consumed: false,
    },
    orderBy: { createdAt: "desc" },
  });

  if (!latestOtp) {
    return { errors: { otp: "No active reset OTP found. Generate a new OTP." } };
  }

  if (isOtpExpired(latestOtp.expiresAt)) {
    return { errors: { otp: "Reset OTP expired. Generate a new OTP." } };
  }

  const isValidOtp = await verifyOtp(otp, latestOtp.otpHash);

  if (!isValidOtp) {
    return { errors: { otp: "Invalid reset OTP." } };
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: await bcrypt.hash(password, 10),
      },
    }),
    prisma.otpCode.update({
      where: { id: latestOtp.id },
      data: { consumed: true },
    }),
  ]);

  redirect("/login?reset=1");
}
