"use server";

import { prisma } from "@/lib/prisma";
import { generateOtp, getOtpExpiry, hashOtp } from "@/lib/otp";

export type ForgotPasswordActionState = {
  message?: string;
  devOtp?: string;
  identifier?: string;
};

export async function requestPasswordReset(
  _prevState: ForgotPasswordActionState,
  formData: FormData
): Promise<ForgotPasswordActionState> {
  const identifier = String(formData.get("identifier") || "").trim().toLowerCase();

  if (!identifier) {
    return { message: "Enter your registered email or phone number." };
  }

  const user = await prisma.user.findFirst({
    where: {
      role: "PATIENT",
      OR: [{ email: identifier }, { phone: identifier }],
    },
  });

  if (!user) {
    return {
      message:
        "If a patient account exists for those details, a reset OTP has been generated.",
      identifier,
    };
  }

  await prisma.otpCode.updateMany({
    where: {
      userId: user.id,
      purpose: "PASSWORD_RESET",
      consumed: false,
    },
    data: { consumed: true },
  });

  const otp = generateOtp();

  await prisma.otpCode.create({
    data: {
      phone: user.phone,
      otpHash: await hashOtp(otp),
      purpose: "PASSWORD_RESET",
      expiresAt: getOtpExpiry(10),
      userId: user.id,
    },
  });

  console.log("DEV PASSWORD RESET OTP:", otp);

  return {
    message: "Password reset OTP generated. Use the dev OTP shown below.",
    devOtp: otp,
    identifier,
  };
}
