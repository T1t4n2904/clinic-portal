"use server";

import * as bcrypt from "bcrypt";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/session";

export type DoctorLoginActionState = {
  message?: string;
};

export async function loginDoctor(
  _prevState: DoctorLoginActionState,
  formData: FormData
): Promise<DoctorLoginActionState> {
  const identifier = String(formData.get("identifier") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  if (!identifier || !password) {
    return { message: "Enter your doctor email or phone number and password." };
  }

  const user = await prisma.user.findFirst({
    where: {
      OR: [{ email: identifier }, { phone: identifier }],
    },
  });

  if (!user) {
    return { message: "Invalid doctor login details." };
  }

  if (user.role !== "DOCTOR") {
    return { message: "This account does not have doctor access." };
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

  if (!isPasswordValid) {
    return { message: "Invalid doctor login details." };
  }

  if (!user.phoneVerified) {
    return { message: "Doctor account is not verified." };
  }

  await createSession(user.id);
  redirect("/doctor/dashboard");
}
