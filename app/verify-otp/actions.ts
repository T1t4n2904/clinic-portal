"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/session";
import { generateOtp, getOtpExpiry, hashOtp, isOtpExpired, verifyOtp } from "@/lib/otp";
import { isTwilioVerifyConfigured, sendVerificationOtp, checkVerificationOtp } from "@/lib/twilio-verify";

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

  if (isTwilioVerifyConfigured()) {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const cookieData = cookieStore.get("registration_data");

    if (!cookieData) {
      return { message: "Registration session expired. Please register again." };
    }

    let registrationData;
    try {
      registrationData = JSON.parse(cookieData.value);
    } catch {
      return { message: "Failed to read registration session. Please register again." };
    }

    const checkResult = await checkVerificationOtp(phone, otp);
    if (!checkResult.success) {
      return { message: checkResult.error || "Invalid or expired OTP. Please try again." };
    }

    // OTP is approved! Create the patient account now
    try {
      const user = await prisma.user.create({
        data: {
          fullName: registrationData.fullName,
          age: registrationData.age,
          gender: registrationData.gender,
          email: registrationData.email,
          phone: registrationData.phone,
          passwordHash: registrationData.passwordHash,
          phoneVerified: true,
          role: "PATIENT",
        },
      });

      cookieStore.delete("registration_data");
      await createSession(user.id);
    } catch (err: any) {
      if (err.code === "P2002") {
        return { message: "This email or phone number is already registered." };
      }
      return { message: "Failed to create patient account. Please try again." };
    }

    redirect("/dashboard");
  }

  // Fallback to existing demo OTP flow
  const latestOtp = await prisma.otpCode.findFirst({
    where: {
      phone,
      purpose: "PHONE_VERIFICATION",
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

  await createSession(latestOtp.userId);
  redirect("/dashboard");
}

export async function resendPhoneOtp(
  _prevState: VerifyOtpActionState,
  formData: FormData
): Promise<VerifyOtpActionState> {
  const phone = String(formData.get("phone") || "").trim();

  if (!/^\d{10}$/.test(phone)) {
    return { message: "Enter a valid 10-digit phone number." };
  }

  if (isTwilioVerifyConfigured()) {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const cookieData = cookieStore.get("registration_data");

    if (!cookieData) {
      return { message: "Registration session not found. Please register again." };
    }

    const otpResult = await sendVerificationOtp(phone);
    if (!otpResult.success) {
      return { message: otpResult.error || "Failed to resend WhatsApp OTP via Twilio Verify." };
    }

    return {
      message: "A new OTP has been sent to your WhatsApp.",
    };
  }

  // Fallback to existing demo OTP flow
  const user = await prisma.user.findUnique({
    where: { phone },
    select: {
      id: true,
      phoneVerified: true,
    },
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
      purpose: "PHONE_VERIFICATION",
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
      purpose: "PHONE_VERIFICATION",
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
