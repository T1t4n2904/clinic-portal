import Link from "next/link";
import type { AppointmentStatus } from "@prisma/client";
import { SubmitButton } from "@/components/SubmitButton";
import { prisma } from "@/lib/prisma";
import { updateAppointmentStatus } from "../appointments/actions";

const todayStart = () => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
};

const tomorrowStart = () => {
  const date = todayStart();
  date.setDate(date.getDate() + 1);
  return date;
};

export default async function DoctorDashboardPage() {
  const start = todayStart();
  const end = tomorrowStart();

  const [appointments, todayConfirmed, checkedIn, inConsultation, completedToday, paymentPending] =
    await Promise.all([
      prisma.appointment.findMany({
        where: {
          slotStart: {
            gte: start,
            lt: end,
          },
        },
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
      }),
      prisma.appointment.count({
        where: {
          status: "CONFIRMED",
          slotStart: { gte: start, lt: end },
        },
      }),
      prisma.appointment.count({
        where: {
          status: "CHECKED_IN",
          slotStart: { gte: start, lt: end },
        },
      }),
      prisma.appointment.count({
        where: {
          status: "IN_CONSULTATION",
          slotStart: { gte: start, lt: end },
        },
      }),
      prisma.appointment.count({
        where: {
          status: "COMPLETED",
          slotStart: { gte: start, lt: end },
        },
      }),
      prisma.appointment.count({
        where: { paymentStatus: "PENDING" },
      }),
    ]);

  return (
    <div className="space-y-5">
      <section className="rounded-xl bg-white p-5 text-slate-900 shadow-sm md:p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <p className="text-sm font-medium text-blue-600">Doctor Dashboard</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight">
              Today&apos;s clinic schedule
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Work through confirmed appointments, check patients in, start
              consultations, and close completed visits.
            </p>
          </div>
          <Link
            href="/doctor/appointments"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 active:scale-[0.98]"
          >
            View all appointments
          </Link>
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="Today confirmed" value={todayConfirmed} />
        <MetricCard label="Waiting / checked-in" value={checkedIn} />
        <MetricCard label="In consultation" value={inConsultation} />
        <MetricCard label="Completed today" value={completedToday} />
        <MetricCard label="Payment pending" value={paymentPending} />
      </div>

      <section className="rounded-xl bg-white p-5 text-slate-900 shadow-sm md:p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Today&apos;s Schedule</h2>
            <p className="mt-1 text-sm text-slate-600">
              Ordered by appointment time.
            </p>
          </div>
          <Link
            href="/doctor/availability"
            className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-700 active:scale-[0.98]"
          >
            Set availability
          </Link>
        </div>

        {appointments.length === 0 ? (
          <p className="mt-5 rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-600">
            No appointments scheduled for today.
          </p>
        ) : (
          <div className="mt-5 divide-y divide-slate-100">
            {appointments.map((appointment) => (
              <div
                key={appointment.id}
                className="grid gap-4 py-4 lg:grid-cols-[1fr_auto]"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/doctor/appointments/${appointment.id}`}
                      className="font-semibold text-slate-950 hover:text-blue-700"
                    >
                      {appointment.patient.fullName}
                    </Link>
                    <Badge>{appointment.mode}</Badge>
                    <Badge>{appointment.paymentStatus}</Badge>
                    <Badge>{formatStatus(appointment.status)}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">
                    {patientMeta(appointment.patient.age, appointment.patient.gender)} ·{" "}
                    {appointment.patient.phone}
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-800">
                    {formatTime(appointment.slotStart)} · {appointment.slotLabel}
                  </p>
                </div>
                <AppointmentActions
                  appointmentId={appointment.id}
                  status={appointment.status}
                  returnTo="/doctor/dashboard"
                />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-white p-4 text-slate-900 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </div>
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
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2 lg:justify-end">
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

function Badge({ children }: { children: string }) {
  return (
    <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
      {children.replace("_", " ")}
    </span>
  );
}

function formatStatus(status: AppointmentStatus) {
  return status.replace("_", " ");
}

function patientMeta(age: number | null, gender: string | null) {
  return [age ? `${age} yrs` : null, gender].filter(Boolean).join(" / ") || "Profile pending";
}

function formatTime(date: Date) {
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}
