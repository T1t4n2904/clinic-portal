import type { ReactNode } from "react";
import { PatientShell } from "@/components/PatientShell";
import { requirePatient } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await requirePatient();

  return <PatientShell fullName={user.fullName}>{children}</PatientShell>;
}
