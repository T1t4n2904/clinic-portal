"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { AppointmentStatus } from "@prisma/client";
import { requireDoctor } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type DoctorAppointmentAction =
  | "CHECK_IN"
  | "START_CONSULTATION"
  | "COMPLETE"
  | "CANCEL";

const nextStatusByAction: Record<
  DoctorAppointmentAction,
  Partial<Record<AppointmentStatus, AppointmentStatus>>
> = {
  CHECK_IN: {
    CONFIRMED: "CHECKED_IN",
  },
  START_CONSULTATION: {
    CONFIRMED: "IN_CONSULTATION",
    CHECKED_IN: "IN_CONSULTATION",
  },
  COMPLETE: {
    IN_CONSULTATION: "COMPLETED",
  },
  CANCEL: {
    PAYMENT_PENDING: "CANCELLED",
    CONFIRMED: "CANCELLED",
    CHECKED_IN: "CANCELLED",
    IN_CONSULTATION: "CANCELLED",
  },
};

export async function updateAppointmentStatus(formData: FormData) {
  await requireDoctor();

  const appointmentId = String(formData.get("appointmentId") || "");
  const action = String(
    formData.get("action") || ""
  ) as DoctorAppointmentAction;
  const returnTo = String(formData.get("returnTo") || "/doctor/appointments");

  if (!appointmentId || !(action in nextStatusByAction)) {
    redirect(returnTo);
  }

  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    select: { id: true, status: true, consultation: { select: { id: true } } },
  });

  if (!appointment) {
    redirect("/doctor/appointments");
  }

  const nextStatus = nextStatusByAction[action][appointment.status];

  if (!nextStatus) {
    redirect(returnTo);
  }

  // Block COMPLETE unless consultation notes have been recorded.
  if (action === "COMPLETE" && !appointment.consultation) {
    redirect(returnTo);
  }

  await prisma.appointment.update({
    where: { id: appointment.id },
    data: { status: nextStatus },
  });

  revalidatePath("/doctor/dashboard");
  revalidatePath("/doctor/appointments");
  revalidatePath(`/doctor/appointments/${appointment.id}`);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/appointments");
  revalidatePath(`/dashboard/appointments/${appointment.id}`);

  if (action === "START_CONSULTATION") {
    redirect(`/doctor/appointments/${appointment.id}`);
  } else {
    redirect(returnTo);
  }
}
