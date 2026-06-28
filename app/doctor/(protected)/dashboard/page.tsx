import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { TodayQueue } from "@/components/TodayQueue";
import { requireDoctor } from "@/lib/auth";

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
  const doctor = await requireDoctor();
  const start = todayStart();
  const end = tomorrowStart();

  const [
    appointments,
    todayConfirmed,
    checkedIn,
    inConsultation,
    completedToday,
    paymentPending,
    ongoingAppointment,
  ] = await Promise.all([
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
    // Query any active ongoing consultation for this doctor to show banner
    prisma.appointment.findFirst({
      where: {
        status: "IN_CONSULTATION",
      },
      select: {
        id: true,
        patient: {
          select: {
            fullName: true,
          },
        },
      },
    }),
  ]);

  const formattedDate = new Date().toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="space-y-4 max-w-5xl">
      {/* Ongoing Consultation Banner */}
      {ongoingAppointment ? (
        <div className="flex items-center justify-between bg-rose-50 border border-rose-200 text-rose-800 rounded-lg px-4 py-2.5 shadow-sm text-xs font-semibold animate-pulse">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-rose-600" />
            <span>
              🔴 Ongoing Consultation:{" "}
              <strong className="text-rose-950 font-bold">
                {ongoingAppointment.patient.fullName}
              </strong>
            </span>
          </div>
          <Link
            href={`/doctor/appointments/${ongoingAppointment.id}`}
            className="inline-flex items-center gap-1 bg-rose-600 hover:bg-rose-700 text-white rounded px-2.5 py-1 text-[10px] transition font-bold"
          >
            Resume →
          </Link>
        </div>
      ) : null}

      {/* Header Panel */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between border-b border-slate-200 pb-3">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            Today
            <span className="text-xs font-medium text-slate-500 font-mono">
              {formattedDate}
            </span>
          </h1>
        </div>

        {/* Small Counters Grid & Quick Links */}
        <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold text-slate-500">
          <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-600 border border-slate-200">
            Waiting: <strong className="text-slate-950 font-bold">{todayConfirmed}</strong>
          </span>
          <span className="px-2 py-0.5 bg-blue-50 rounded text-blue-700 border border-blue-100">
            Checked In: <strong className="text-blue-950 font-bold">{checkedIn}</strong>
          </span>
          <span className="px-2 py-0.5 bg-emerald-50 rounded text-emerald-800 border border-emerald-100">
            Ongoing: <strong className="text-emerald-950 font-bold">{inConsultation}</strong>
          </span>
          <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-600 border border-slate-200">
            Completed: <strong className="text-slate-950 font-bold">{completedToday}</strong>
          </span>
          {paymentPending > 0 ? (
            <span className="px-2 py-0.5 bg-red-50 rounded text-red-700 border border-red-100">
              Pending Pay: <strong className="text-red-950 font-bold">{paymentPending}</strong>
            </span>
          ) : null}

          <div className="ml-2 pl-2 border-l border-slate-200 flex items-center gap-2">
            <Link
              href="/doctor/availability"
              className="text-xs font-semibold text-emerald-800 hover:text-emerald-700"
            >
              Set availability
            </Link>
          </div>
        </div>
      </div>

      {/* Main Workspace Queue */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Today&apos;s Queue
          </h2>
          <span className="text-[10px] text-slate-500 font-semibold font-mono">
            {appointments.length} scheduled
          </span>
        </div>

        <TodayQueue appointments={appointments} />
      </div>
    </div>
  );
}

