import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";

export async function requirePatient() {
  const userId = await getSessionUserId();

  if (!userId) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "PATIENT") {
    redirect("/doctor/dashboard");
  }

  return user;
}

export async function requireDoctor() {
  const userId = await getSessionUserId();

  if (!userId) {
    redirect("/doctor/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user || user.role !== "DOCTOR") {
    redirect("/doctor/login");
  }

  return user;
}
