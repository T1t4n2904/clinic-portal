import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function DoctorDashboardPage() {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [totalPatients, verifiedPatients, newPatientsToday] = await Promise.all([
    prisma.user.count({ where: { role: "PATIENT" } }),
    prisma.user.count({ where: { role: "PATIENT", phoneVerified: true } }),
    prisma.user.count({
      where: {
        role: "PATIENT",
        createdAt: {
          gte: startOfToday,
        },
      },
    }),
  ]);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-white p-8 text-slate-900 shadow-sm">
        <p className="text-sm font-medium text-blue-600">Doctor Dashboard</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">
          Clinic patient overview
        </h1>
        <p className="mt-3 text-sm text-slate-600">
          A lightweight staff view for registered patient accounts.
        </p>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Total patients" value={totalPatients.toString()} />
        <MetricCard label="Verified patients" value={verifiedPatients.toString()} />
        <MetricCard label="New today" value={newPatientsToday.toString()} />
      </div>

      <section className="rounded-2xl bg-white p-6 text-slate-900 shadow-sm">
        <h2 className="text-xl font-semibold">Patient directory</h2>
        <p className="mt-2 text-sm text-slate-600">
          Review registered patient profiles. Medical records are intentionally
          not implemented yet.
        </p>
        <Link
          href="/doctor/patients"
          className="mt-5 inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          View patients
        </Link>
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
