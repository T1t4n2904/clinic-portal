"use server";

import * as bcrypt from "bcrypt";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { generateOtp, getOtpExpiry, hashOtp } from "@/lib/otp";

export type DoctorLoginActionState = {
  errors?: Record<string, string>;
  message?: string;
};

export async function loginDoctor(
  _prevState: DoctorLoginActionState,
  formData: FormData
): Promise<DoctorLoginActionState> {
  const identifier = String(formData.get("identifier") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  if (!identifier || !password) {
    return {
      errors: {
        ...(!identifier ? { identifier: "Enter your doctor email or phone number." } : {}),
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
    return { errors: { identifier: "No doctor account found for these details." } };
  }

  if (user.role !== "DOCTOR") {
    return { errors: { identifier: "This account does not have doctor access." } };
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

  if (!isPasswordValid) {
    return { errors: { password: "Incorrect password." } };
  }

  if (!user.phoneVerified) {
    return { errors: { identifier: "Doctor account is not verified." } };
  }

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

  console.log("DEV DOCTOR LOGIN OTP:", otp);

  redirect(`/verify-login-otp?challenge=${loginOtp.id}&devOtp=${otp}`);
}
