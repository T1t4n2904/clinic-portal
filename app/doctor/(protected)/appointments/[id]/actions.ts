"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireDoctor } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type ConsultationActionState = {
  errors?: Record<string, string>;
  message?: string;
};

export async function saveConsultation(
  _prevState: ConsultationActionState,
  formData: FormData
): Promise<ConsultationActionState> {
  const doctor = await requireDoctor();

  const appointmentId = String(formData.get("appointmentId") || "");
  const chiefComplaint = String(formData.get("chiefComplaint") || "").trim();
  const symptoms = String(formData.get("symptoms") || "").trim();
  const diagnosis = String(formData.get("diagnosis") || "").trim();
  const advice = String(formData.get("advice") || "").trim();
  const followUpDateRaw = String(formData.get("followUpDate") || "").trim();

  const errors: Record<string, string> = {};

  if (!chiefComplaint) errors.chiefComplaint = "Chief complaint is required.";
  if (!symptoms) errors.symptoms = "Symptoms are required.";
  if (!diagnosis) errors.diagnosis = "Diagnosis is required.";
  if (!advice) errors.advice = "Advice is required.";

  let followUpDate: Date | null = null;
  if (followUpDateRaw) {
    const parsed = new Date(followUpDateRaw);
    if (Number.isNaN(parsed.getTime())) {
      errors.followUpDate = "Invalid date.";
    } else {
      followUpDate = parsed;
    }
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    select: { id: true, status: true, patientId: true, consultation: true },
  });

  if (!appointment) {
    return { message: "Appointment not found." };
  }

  if (appointment.status !== "IN_CONSULTATION") {
    return { message: "Consultation notes can only be added during active consultation." };
  }

  if (appointment.consultation) {
    return { message: "Consultation notes already exist for this appointment." };
  }

  await prisma.$transaction([
    prisma.consultation.create({
      data: {
        appointmentId: appointment.id,
        doctorId: doctor.id,
        patientId: appointment.patientId,
        chiefComplaint,
        symptoms,
        diagnosis,
        advice,
        followUpDate,
      },
    }),
    prisma.appointment.update({
      where: { id: appointment.id },
      data: { status: "COMPLETED" },
    }),
  ]);

  revalidatePath("/doctor/dashboard");
  revalidatePath("/doctor/appointments");
  revalidatePath(`/doctor/appointments/${appointment.id}`);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/appointments");
  revalidatePath(`/dashboard/appointments/${appointment.id}`);
  redirect(`/doctor/appointments/${appointment.id}`);
}
