"use server";

import * as bcrypt from "bcrypt";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/session";

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

  await createSession(user.id);
  redirect("/doctor/dashboard");
}
