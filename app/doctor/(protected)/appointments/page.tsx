import Link from "next/link";
import type { AppointmentStatus, Prisma } from "@prisma/client";
import { SubmitButton } from "@/components/SubmitButton";
import { prisma } from "@/lib/prisma";
import { updateAppointmentStatus } from "./actions";

type DoctorAppointmentsPageProps = {
  searchParams: Promise<{ filter?: string }>;
};

const filters = [
  { label: "Today", value: "today" },
  { label: "Upcoming", value: "upcoming" },
  { label: "Payment Pending", value: "payment-pending" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
  { label: "All", value: "all" },
];

export default async function DoctorAppointmentsPage({
  searchParams,
}: DoctorAppointmentsPageProps) {
  const query = await searchParams;
  const activeFilter = filters.some((filter) => filter.value === query.filter)
    ? query.filter ?? "today"
    : "today";
  const where = getAppointmentWhere(activeFilter);
  const appointments = await prisma.appointment.findMany({
    where,
    select: {
      id: true,
      mode: true,
      slotLabel: true,
      slotStart: true,
      status: true,
      paymentStatus: true,
      patient: {
        select: {
          fullName: true,
          age: true,
          gender: true,
          phone: true,
        },
      },
    },
    orderBy: { slotStart: "asc" },
  });

  return (
    <section className="rounded-xl bg-white p-5 text-slate-900 shadow-sm md:p-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <p className="text-sm font-medium text-blue-600">Appointments</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">
            Clinic appointments
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Filter appointments by operational status and move patients through
            the visit lifecycle.
          </p>
        </div>
        <Link
          href="/doctor/dashboard"
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 active:scale-[0.98]"
        >
          Back to dashboard
        </Link>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {filters.map((filter) => (
          <Link
            key={filter.value}
            href={`/doctor/appointments?filter=${filter.value}`}
            className={`rounded-full border px-3 py-1.5 text-sm font-medium transition active:scale-[0.98] ${
              activeFilter === filter.value
                ? "border-blue-600 bg-blue-600 text-white"
                : "border-slate-300 text-slate-700 hover:bg-slate-100"
            }`}
          >
            {filter.label}
          </Link>
        ))}
      </div>

      {appointments.length === 0 ? (
        <p className="mt-6 rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-600">
          No appointments found for this filter.
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[980px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                <th className="py-3 pr-4">Patient</th>
                <th className="py-3 pr-4">Phone</th>
                <th className="py-3 pr-4">Mode</th>
                <th className="py-3 pr-4">Slot</th>
                <th className="py-3 pr-4">Status</th>
                <th className="py-3 pr-4">Payment</th>
                <th className="py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appointment) => (
                <tr key={appointment.id} className="border-b border-slate-100">
                  <td className="py-3 pr-4">
                    <Link
                      href={`/doctor/appointments/${appointment.id}`}
                      className="font-medium text-slate-950 hover:text-blue-700"
                    >
                      {appointment.patient.fullName}
                    </Link>
                    <p className="text-xs text-slate-500">
                      {patientMeta(appointment.patient.age, appointment.patient.gender)}
                    </p>
                  </td>
                  <td className="py-3 pr-4">{appointment.patient.phone}</td>
                  <td className="py-3 pr-4">{appointment.mode}</td>
                  <td className="py-3 pr-4">
                    <p>{appointment.slotLabel}</p>
                    <p className="text-xs text-slate-500">
                      {appointment.slotStart.toLocaleString()}
                    </p>
                  </td>
                  <td className="py-3 pr-4">{formatStatus(appointment.status)}</td>
                  <td className="py-3 pr-4">{appointment.paymentStatus}</td>
                  <td className="py-3">
                    <AppointmentActions
                      appointmentId={appointment.id}
                      status={appointment.status}
                      returnTo={`/doctor/appointments?filter=${activeFilter}`}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function getAppointmentWhere(filter: string): Prisma.AppointmentWhereInput {
  const now = new Date();
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  if (filter === "today") {
    return { slotStart: { gte: start, lt: end } };
  }

  if (filter === "upcoming") {
    return {
      slotStart: { gte: now },
      status: { notIn: ["CANCELLED", "COMPLETED"] },
    };
  }

  if (filter === "payment-pending") {
    return { paymentStatus: "PENDING" };
  }

  if (filter === "completed") {
    return { status: "COMPLETED" };
  }

  if (filter === "cancelled") {
    return { status: "CANCELLED" };
  }

  return {};
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
      <Link
        href={`/doctor/appointments/${appointmentId}`}
        className="font-medium text-blue-600 hover:text-blue-700"
      >
        View
      </Link>
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
        label: "Start",
        value: "START_CONSULTATION",
        variant: "primary",
      },
    ];
  }

  if (status === "IN_CONSULTATION") {
    primary = [{ label: "Complete", value: "COMPLETE", variant: "primary" }];
  }

  const canCancel = status !== "COMPLETED" && status !== "CANCELLED";

  return canCancel
    ? [
        ...primary,
        { label: "Cancel", value: "CANCEL", variant: "secondary" as const },
      ]
    : primary;
}

function formatStatus(status: AppointmentStatus) {
  return status.replace("_", " ");
}

function patientMeta(age: number | null, gender: string | null) {
  return [age ? `${age} yrs` : null, gender].filter(Boolean).join(" / ") || "Profile pending";
}
