"use server";

import * as bcrypt from "bcrypt";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/session";

export type LoginActionState = {
  message?: string;
};

export async function loginPatient(
  _prevState: LoginActionState,
  formData: FormData
): Promise<LoginActionState> {
  const identifier = String(formData.get("identifier") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  if (!identifier || !password) {
    return { message: "Enter your email or phone number and password." };
  }

  const user = await prisma.user.findFirst({
    where: {
      OR: [{ email: identifier }, { phone: identifier }],
    },
  });

  if (!user) {
    return { message: "Invalid login details." };
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

  if (!isPasswordValid) {
    return { message: "Invalid login details." };
  }

  if (!user.phoneVerified) {
    return { message: "Please verify your phone number before logging in." };
  }

  await createSession(user.id);
  redirect("/dashboard");
}
