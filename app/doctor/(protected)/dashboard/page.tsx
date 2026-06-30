import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireDoctor } from "@/lib/auth";
import { ConsultationsWorkspace } from "@/components/ConsultationsWorkspace";

export default async function DoctorDashboardPage() {
  const doctor = await requireDoctor();

  // Fetch all appointments (excluding PAYMENT_PENDING by default, but let's query all so workspace handles filters)
  const [appointments, ongoingAppointment] = await Promise.all([
    prisma.appointment.findMany({
      include: {
        patient: {
          select: {
            id: true,
            fullName: true,
            age: true,
            gender: true,
            phone: true,
            email: true,
          },
        },
      },
      orderBy: { slotStart: "asc" },
    }),
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
    <div className="space-y-4 max-w-5xl text-slate-900">
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
            Consultations
            <span className="text-xs font-medium text-slate-500 font-mono">
              {formattedDate}
            </span>
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/doctor/availability"
            className="text-xs font-semibold text-emerald-800 hover:text-emerald-700"
          >
            Set availability schedule
          </Link>
        </div>
      </div>

      {/* Main Workspace Queue */}
      <div>
        <ConsultationsWorkspace initialAppointments={appointments} />
      </div>
    </div>
  );
}
