import Link from "next/link";
import { notFound } from "next/navigation";
import type { AppointmentStatus } from "@prisma/client";
import { SubmitButton } from "@/components/SubmitButton";
import { prisma } from "@/lib/prisma";
import { updateAppointmentStatus } from "../actions";

type DoctorAppointmentDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function DoctorAppointmentDetailPage({
  params,
}: DoctorAppointmentDetailPageProps) {
  const { id } = await params;
  const appointment = await prisma.appointment.findUnique({
    where: { id },
    select: {
      id: true,
      mode: true,
      slotLabel: true,
      slotStart: true,
      status: true,
      paymentStatus: true,
      amount: true,
      patient: {
        select: {
          fullName: true,
          age: true,
          gender: true,
          phone: true,
          email: true,
        },
      },
    },
  });

  if (!appointment) {
    notFound();
  }

  return (
    <section className="rounded-xl bg-white p-5 text-slate-900 shadow-sm md:p-6">
      <Link
        href="/doctor/appointments"
        className="text-sm font-medium text-blue-600 hover:text-blue-700"
      >
        Back to appointments
      </Link>

      <div className="mt-5 flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div>
          <p className="text-sm font-medium text-blue-600">Appointment Detail</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">
            {appointment.patient.fullName}
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            {patientMeta(appointment.patient.age, appointment.patient.gender)} ·{" "}
            {appointment.patient.phone}
          </p>
        </div>
        <AppointmentActions
          appointmentId={appointment.id}
          status={appointment.status}
          returnTo={`/doctor/appointments/${appointment.id}`}
        />
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-2">
        <Detail label="Patient" value={appointment.patient.fullName} />
        <Detail label="Phone" value={appointment.patient.phone} />
        <Detail label="Email" value={appointment.patient.email} />
        <Detail label="Mode" value={appointment.mode} />
        <Detail label="Slot" value={appointment.slotLabel} />
        <Detail label="Slot time" value={appointment.slotStart.toLocaleString()} />
        <Detail label="Amount" value={`Rs. ${appointment.amount}`} />
        <Detail label="Status" value={formatStatus(appointment.status)} />
        <Detail label="Payment" value={appointment.paymentStatus} />
      </div>
    </section>
  );
}

function AppointmentActions({
  appointmentId,
  status,
  returnTo,
}: {
  appointmentId: string;
  status: AppointmentStatus;
  returnTo: string;
}) {
  const actions = getAvailableActions(status);

  if (actions.length === 0) {
    return (
      <p className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
        No further status actions available.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((action) => (
        <form key={action.value} action={updateAppointmentStatus}>
          <input type="hidden" name="appointmentId" value={appointmentId} />
          <input type="hidden" name="action" value={action.value} />
          <input type="hidden" name="returnTo" value={returnTo} />
          <SubmitButton
            fullWidth={false}
            variant={action.variant}
            pendingText="Updating..."
          >
            {action.label}
          </SubmitButton>
        </form>
      ))}
    </div>
  );
}

function getAvailableActions(status: AppointmentStatus) {
  let primary: Array<{
    label: string;
    value: string;
    variant: "primary" | "secondary" | "ghost";
  }> = [];

  if (status === "CONFIRMED") {
    primary = [{ label: "Check in", value: "CHECK_IN", variant: "primary" }];
  }

  if (status === "CHECKED_IN") {
    primary = [
      {
        label: "Start consultation",
        value: "START_CONSULTATION",
        variant: "primary",
      },
    ];
  }

  if (status === "IN_CONSULTATION") {
    primary = [
      { label: "Mark completed", value: "COMPLETE", variant: "primary" },
    ];
  }

  const canCancel = status !== "COMPLETED" && status !== "CANCELLED";

  return canCancel
    ? [
        ...primary,
        { label: "Cancel", value: "CANCEL", variant: "secondary" as const },
      ]
    : primary;
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium">{value}</p>
    </div>
  );
}

function formatStatus(status: AppointmentStatus) {
  return status.replace("_", " ");
}

function patientMeta(age: number | null, gender: string | null) {
  return [age ? `${age} yrs` : null, gender].filter(Boolean).join(" / ") || "Profile pending";
}
