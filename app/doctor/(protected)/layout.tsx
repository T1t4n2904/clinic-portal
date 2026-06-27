import type { ReactNode } from "react";
import { DoctorShell } from "@/components/DoctorShell";
import { requireDoctor } from "@/lib/auth";

export default async function DoctorProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const doctor = await requireDoctor();

  return <DoctorShell fullName={doctor.fullName}>{children}</DoctorShell>;
}
