"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { AppointmentMode } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requirePatient } from "@/lib/auth";
import { DEMO_APPOINTMENT_AMOUNT, getDemoSlot } from "@/lib/appointments";

export type AppointmentActionState = {
  errors?: Record<string, string>;
  message?: string;
};

export async function createDemoAppointment(
  _prevState: AppointmentActionState,
  formData: FormData
): Promise<AppointmentActionState> {
  const patient = await requirePatient();
  const modeInput = String(formData.get("mode") || "");
  const slotId = String(formData.get("slotId") || "");
  const errors: Record<string, string> = {};

  if (modeInput !== "ONLINE" && modeInput !== "OFFLINE") {
    errors.mode = "Choose online or offline consultation.";
  }

  const slot = getDemoSlot(slotId);

  if (!slot) {
    errors.slotId = "Choose an appointment slot.";
  }

  if (slot && slot.mode !== modeInput) {
    errors.slotId = "Choose a slot that matches the selected mode.";
  }

  if (Object.keys(errors).length > 0 || !slot) {
    return { errors };
  }

  const appointment = await prisma.appointment.create({
    data: {
      patientId: patient.id,
      mode: modeInput as AppointmentMode,
      slotStart: slot.slotStart,
      slotLabel: slot.label,
      amount: DEMO_APPOINTMENT_AMOUNT,
      paymentStatus: "PENDING",
      status: "PAYMENT_PENDING",
    },
  });

  redirect(`/dashboard/appointments/${appointment.id}`);
}

export async function demoPayAppointment(formData: FormData) {
  const patient = await requirePatient();
  const appointmentId = String(formData.get("appointmentId") || "");

  const appointment = await prisma.appointment.findFirst({
    where: {
      id: appointmentId,
      patientId: patient.id,
    },
  });

  if (!appointment) {
    redirect("/dashboard/appointments");
  }

  await prisma.appointment.update({
    where: { id: appointment.id },
    data: {
      paymentStatus: "PAID",
      status: "CONFIRMED",
    },
  });

  redirect(`/dashboard/appointments/${appointment.id}?paid=1`);
}

export async function cancelPatientAppointment(formData: FormData) {
  const patient = await requirePatient();
  const appointmentId = String(formData.get("appointmentId") || "");

  const appointment = await prisma.appointment.findFirst({
    where: {
      id: appointmentId,
      patientId: patient.id,
    },
    select: {
      id: true,
      status: true,
    },
  });

  if (!appointment) {
    redirect("/dashboard/appointments");
  }

  if (appointment.status !== "COMPLETED" && appointment.status !== "CANCELLED") {
    await prisma.appointment.update({
      where: { id: appointment.id },
      data: { status: "CANCELLED" },
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/appointments");
    revalidatePath(`/dashboard/appointments/${appointment.id}`);
  }

  redirect(`/dashboard/appointments/${appointment.id}?cancelled=1`);
}
