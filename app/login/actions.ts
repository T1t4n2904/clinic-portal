"use server";

import * as bcrypt from "bcrypt";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/session";

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
    return { errors: { identifier: "Please verify your phone number before logging in." } };
  }

  await createSession(user.id);
  redirect("/dashboard");
}
