"use server";

import { redirect } from "next/navigation";
import { clearSession } from "@/lib/session";

export async function logoutDoctor() {
  await clearSession();
  redirect("/doctor/login");
}
