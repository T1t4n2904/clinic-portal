import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function DoctorDashboardPage() {
  const now = new Date();
  const [
    totalAppointments,
    confirmedUpcomingAppointments,
    paymentPendingAppointments,
    appointmentPatients,
  ] = await Promise.all([
    prisma.appointment.count(),
    prisma.appointment.count({
      where: {
        status: "CONFIRMED",
        slotStart: {
          gte: now,
        },
      },
    }),
    prisma.appointment.count({
      where: {
        paymentStatus: "PENDING",
      },
    }),
    prisma.appointment.findMany({
      distinct: ["patientId"],
      select: { patientId: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-white p-8 text-slate-900 shadow-sm">
        <p className="text-sm font-medium text-blue-600">Doctor Dashboard</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">
          Appointment command center
        </h1>
        <p className="mt-3 text-sm text-slate-600">
          Focused on booked appointments and appointment-linked patients. General
          registration analytics are intentionally hidden.
        </p>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total appointments" value={totalAppointments.toString()} />
        <MetricCard
          label="Confirmed upcoming"
          value={confirmedUpcomingAppointments.toString()}
        />
        <MetricCard
          label="Payment pending"
          value={paymentPendingAppointments.toString()}
        />
        <MetricCard
          label="Appointment-linked patients"
          value={appointmentPatients.length.toString()}
        />
      </div>

      <section className="rounded-2xl bg-white p-6 text-slate-900 shadow-sm">
        <h2 className="text-xl font-semibold">Clinic appointments</h2>
        <p className="mt-2 text-sm text-slate-600">
          Review booked appointments first. Patient directory only includes
          patients with at least one appointment.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/doctor/appointments"
            className="inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 active:scale-[0.98]"
          >
            View appointments
          </Link>
          <Link
            href="/doctor/patients"
            className="inline-flex rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 active:scale-[0.98]"
          >
            View patient directory
          </Link>
        </div>
      </section>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white p-6 text-slate-900 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-3 text-3xl font-bold">{value}</p>
    </div>
  );
}
