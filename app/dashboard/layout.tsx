import type { ReactNode } from "react";
import { PatientShell } from "@/components/PatientShell";
import { requirePatient } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await requirePatient();

  const notifications = await prisma.notificationLog.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 5,
    select: {
      id: true,
      type: true,
      message: true,
      status: true,
      createdAt: true,
      appointmentId: true,
    },
  });

  return (
    <PatientShell fullName={user.fullName} notifications={notifications}>
      {children}
    </PatientShell>
  );
}
