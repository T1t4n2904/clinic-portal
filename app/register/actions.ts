"use server";

import * as bcrypt from "bcrypt";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { generateOtp, getOtpExpiry, hashOtp } from "@/lib/otp";
import { validateRegisterInput } from "@/lib/validation";

export type RegisterActionState = {
  errors?: Record<string, string>;
  message?: string;
};

export async function registerPatient(
  _prevState: RegisterActionState,
  formData: FormData
): Promise<RegisterActionState> {
  const input = {
    fullName: String(formData.get("fullName") || ""),
    age: String(formData.get("age") || ""),
    gender: String(formData.get("gender") || ""),
    email: String(formData.get("email") || ""),
    phone: String(formData.get("phone") || ""),
    password: String(formData.get("password") || ""),
    confirmPassword: String(formData.get("confirmPassword") || ""),
  };

  const result = validateRegisterInput(input);

  if (!result.isValid) {
    return { errors: result.errors };
  }

  const existingEmail = await prisma.user.findUnique({
    where: { email: result.data.email },
  });

  if (existingEmail) {
    return { errors: { email: "This email is already registered." } };
  }

  const existingPhone = await prisma.user.findUnique({
    where: { phone: result.data.phone },
  });

  if (existingPhone) {
    return { errors: { phone: "This phone number is already registered." } };
  }

  const passwordHash = await bcrypt.hash(result.data.password, 10);

  const { isTwilioVerifyConfigured, sendVerificationOtp } = await import("@/lib/twilio-verify");

  if (isTwilioVerifyConfigured()) {
    const { cookies } = await import("next/headers");
    const registrationData = {
      fullName: result.data.fullName,
      age: result.data.age,
      gender: result.data.gender,
      email: result.data.email,
      phone: result.data.phone,
      passwordHash,
    };
    (await cookies()).set("registration_data", JSON.stringify(registrationData), {
      maxAge: 900, // 15 mins
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });

    const otpResult = await sendVerificationOtp(result.data.phone);
    if (!otpResult.success) {
      return { message: otpResult.error || "Failed to send WhatsApp verification OTP code via Twilio Verify." };
    }

    redirect(`/verify-otp?phone=${result.data.phone}`);
  }

  // Fallback to existing demo OTP flow
  const user = await prisma.user.create({
    data: {
      fullName: result.data.fullName,
      age: result.data.age,
      gender: result.data.gender,
      email: result.data.email,
      phone: result.data.phone,
      passwordHash,
      role: "PATIENT",
    },
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

  console.log("DEV OTP:", otp);

  redirect(`/verify-otp?phone=${user.phone}&devOtp=${otp}`);
}
