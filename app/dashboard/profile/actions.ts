"use server";

import { prisma } from "@/lib/prisma";
import { requirePatient } from "@/lib/auth";

export type ProfileActionState = {
  errors?: Record<string, string>;
  message?: string;
};

export async function updatePatientProfile(
  _prevState: ProfileActionState,
  formData: FormData
): Promise<ProfileActionState> {
  const user = await requirePatient();
  const fullName = String(formData.get("fullName") || "").trim();
  const ageInput = String(formData.get("age") || "").trim();
  const gender = String(formData.get("gender") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const errors: Record<string, string> = {};
  const age = ageInput ? Number(ageInput) : null;

  if (!fullName) {
    errors.fullName = "Full name is required.";
  }

  if (age !== null && (!Number.isInteger(age) || age <= 0)) {
    errors.age = "Age must be a positive whole number.";
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Enter a valid email address.";
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  const existingEmail = await prisma.user.findUnique({
    where: { email },
  });

  if (existingEmail && existingEmail.id !== user.id) {
    return { errors: { email: "This email is already used by another account." } };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      fullName,
      age,
      gender: gender || null,
      email,
    },
  });

  return { message: "Profile updated successfully." };
}
