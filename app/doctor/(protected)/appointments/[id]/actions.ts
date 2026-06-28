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

export type PrescriptionActionState = {
  errors?: Record<string, string>;
  message?: string;
};

export async function savePrescription(
  _prevState: PrescriptionActionState,
  formData: FormData
): Promise<PrescriptionActionState> {
  const doctor = await requireDoctor();

  const appointmentId = String(formData.get("appointmentId") || "");
  const generalAdvice = String(formData.get("generalAdvice") || "").trim();
  const dietAdvice = String(formData.get("dietAdvice") || "").trim();
  const followUpDateRaw = String(formData.get("followUpDate") || "").trim();

  const medicineNames = formData.getAll("medicineName").map(String);
  const dosages = formData.getAll("dosage").map(String);
  const frequencies = formData.getAll("frequency").map(String);
  const durations = formData.getAll("duration").map(String);
  const instructionsList = formData.getAll("instructions").map(String);

  const errors: Record<string, string> = {};

  const medicines: Array<{
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
  }> = [];

  for (let i = 0; i < medicineNames.length; i++) {
    const name = medicineNames[i]?.trim();
    if (name) {
      medicines.push({
        name,
        dosage: (dosages[i] || "").trim(),
        frequency: (frequencies[i] || "").trim(),
        duration: (durations[i] || "").trim(),
        instructions: (instructionsList[i] || "").trim(),
      });
    }
  }

  if (medicines.length === 0 && !generalAdvice && !dietAdvice) {
    return { message: "Prescription must contain at least one medicine OR advice text." };
  }

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
    select: {
      id: true,
      status: true,
      patientId: true,
      consultation: {
        select: {
          id: true,
          prescription: { select: { id: true } },
        },
      },
    },
  });

  if (!appointment) {
    return { message: "Appointment not found." };
  }

  if (!appointment.consultation) {
    return { message: "Cannot create prescription without consultation notes first." };
  }

  if (appointment.status !== "COMPLETED") {
    return { message: "Prescription can only be added to completed consultations." };
  }

  if (appointment.consultation.prescription) {
    return { message: "Prescription already exists for this consultation." };
  }

  const { sendDemoNotification } = await import("@/lib/notifications/demo");
  const patientUser = await prisma.user.findUnique({
    where: { id: appointment.patientId },
    select: { fullName: true, phone: true },
  });

  await prisma.$transaction(async (tx) => {
    const prescription = await tx.prescription.create({
      data: {
        consultationId: appointment.consultation!.id,
        appointmentId: appointment.id,
        doctorId: doctor.id,
        patientId: appointment.patientId,
        generalAdvice: generalAdvice || null,
        dietAdvice: dietAdvice || null,
        followUpDate,
      },
    });

    if (medicines.length > 0) {
      await tx.prescriptionMedicine.createMany({
        data: medicines.map((med, index) => ({
          prescriptionId: prescription.id,
          medicineName: med.name,
          dosage: med.dosage,
          frequency: med.frequency,
          duration: med.duration,
          instructions: med.instructions || null,
          sortOrder: index,
        })),
      });
    }
  });

  if (patientUser) {
    await sendDemoNotification({
      userId: appointment.patientId,
      appointmentId: appointment.id,
      type: "PRESCRIPTION_READY",
      recipient: patientUser.phone,
      message: `Namaste ${patientUser.fullName}, your prescription for ${appointment.id} is ready.`,
    });
  }

  revalidatePath("/doctor/dashboard");
  revalidatePath("/doctor/appointments");
  revalidatePath(`/doctor/appointments/${appointment.id}`);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/appointments");
  revalidatePath(`/dashboard/appointments/${appointment.id}`);
  redirect(`/doctor/appointments/${appointment.id}`);
}
