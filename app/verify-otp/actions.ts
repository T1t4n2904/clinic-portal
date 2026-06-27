"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { generateOtp, getOtpExpiry, hashOtp, isOtpExpired, verifyOtp } from "@/lib/otp";

export type VerifyOtpActionState = {
  message?: string;
  devOtp?: string;
};

export async function verifyPhoneOtp(
  _prevState: VerifyOtpActionState,
  formData: FormData
): Promise<VerifyOtpActionState> {
  const phone = String(formData.get("phone") || "").trim();
  const otp = String(formData.get("otp") || "").trim();

  if (!/^\d{10}$/.test(phone)) {
    return { message: "Enter a valid 10-digit phone number." };
  }

  if (!/^\d{6}$/.test(otp)) {
    return { message: "Enter a valid 6-digit OTP." };
  }

  const latestOtp = await prisma.otpCode.findFirst({
    where: {
      phone,
      consumed: false,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!latestOtp) {
    return { message: "No active OTP found. Please register again or resend OTP." };
  }

  if (isOtpExpired(latestOtp.expiresAt)) {
    return { message: "OTP expired. Please request a new one." };
  }

  const isValid = await verifyOtp(otp, latestOtp.otpHash);

  if (!isValid) {
    return { message: "Invalid OTP." };
  }

  await prisma.$transaction([
    prisma.otpCode.update({
      where: { id: latestOtp.id },
      data: { consumed: true },
    }),
    prisma.user.update({
      where: { id: latestOtp.userId },
      data: { phoneVerified: true },
    }),
  ]);

  redirect("/?verified=1");
}

export async function resendPhoneOtp(
  _prevState: VerifyOtpActionState,
  formData: FormData
): Promise<VerifyOtpActionState> {
  const phone = String(formData.get("phone") || "").trim();

  if (!/^\d{10}$/.test(phone)) {
    return { message: "Enter a valid 10-digit phone number." };
  }

  const user = await prisma.user.findUnique({
    where: { phone },
  });

  if (!user) {
    return { message: "No patient account found for this phone number." };
  }

  if (user.phoneVerified) {
    return { message: "This phone number is already verified. Please login." };
  }

  await prisma.otpCode.updateMany({
    where: {
      phone,
      consumed: false,
    },
    data: {
      consumed: true,
    },
  });

  const otp = generateOtp();

  await prisma.otpCode.create({
    data: {
      phone,
      otpHash: await hashOtp(otp),
      expiresAt: getOtpExpiry(5),
      userId: user.id,
    },
  });

  console.log("DEV RESENT OTP:", otp);

  return {
    message: "A new OTP was generated. Use the dev OTP shown below.",
    devOtp: otp,
  };
}
