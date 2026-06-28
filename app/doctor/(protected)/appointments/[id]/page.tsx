import Link from "next/link";
import { notFound } from "next/navigation";
import type { AppointmentStatus } from "@prisma/client";
import { SubmitButton } from "@/components/SubmitButton";
import { ConsultationForm } from "@/components/ConsultationForm";
import { ConsultationView } from "@/components/ConsultationView";
import { PrescriptionForm } from "@/components/PrescriptionForm";
import { PrescriptionView } from "@/components/PrescriptionView";
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
      consultation: {
        select: {
          id: true,
          chiefComplaint: true,
          symptoms: true,
          diagnosis: true,
          advice: true,
          followUpDate: true,
          createdAt: true,
          prescription: {
            include: {
              medicines: {
                orderBy: { sortOrder: "asc" },
              },
            },
          },
        },
      },
      payments: {
        select: {
          id: true,
          provider: true,
          status: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      },
      notificationLogs: {
        select: {
          id: true,
          channel: true,
          type: true,
          status: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!appointment) {
    notFound();
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 text-slate-900 shadow-sm md:p-6">
      <Link
        href="/doctor/appointments"
        className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
      >
        ← Back
      </Link>

      <div className="mt-4 flex flex-col justify-between gap-4 lg:flex-row lg:items-start border-b border-slate-100 pb-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">Appointment Detail</p>
          <h1 className="mt-1 text-lg font-bold tracking-tight">
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

      {/* Payment History */}
      {appointment.payments.length > 0 ? (
        <div className="mt-6 border-t border-slate-100 pt-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Payment History</h3>
          <div className="space-y-1.5">
            {appointment.payments.map((p) => (
              <div key={p.id} className="flex justify-between items-center text-xs text-slate-600 bg-slate-50 rounded border border-slate-100 px-3 py-1.5">
                <span>{p.provider} Payment</span>
                <span className="font-semibold text-slate-900">{p.status}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Notification Logs */}
      {appointment.notificationLogs.length > 0 ? (
        <div className="mt-6 border-t border-slate-100 pt-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Notification Logs</h3>
          <div className="space-y-1.5">
            {appointment.notificationLogs.map((log) => (
              <div key={log.id} className="flex justify-between items-center text-xs text-slate-600 bg-slate-50 rounded border border-slate-100 px-3 py-1.5">
                <div>
                  <span className="font-semibold text-slate-900">{log.type.replace("_", " ")}</span>
                  <span className="text-[10px] text-slate-400 ml-1.5">({log.channel})</span>
                </div>
                <span className={`font-semibold ${log.status === "SENT" ? "text-emerald-700" : "text-red-600"}`}>
                  {log.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {appointment.consultation ? (
        <>
          <ConsultationView consultation={appointment.consultation} />
          {appointment.consultation.prescription ? (
            <PrescriptionView prescription={appointment.consultation.prescription} />
          ) : appointment.status === "COMPLETED" ? (
            <PrescriptionForm appointmentId={appointment.id} />
          ) : null}
        </>
      ) : appointment.status === "IN_CONSULTATION" ? (
        <ConsultationForm appointmentId={appointment.id} />
      ) : null}
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

  // IN_CONSULTATION: completion happens via consultation form, no manual complete button.

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
