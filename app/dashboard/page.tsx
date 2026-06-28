import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requirePatient } from "@/lib/auth";

export default async function DashboardPage() {
  const user = await requirePatient();
  const nextAppointment = await prisma.appointment.findFirst({
    where: {
      patientId: user.id,
      status: {
        notIn: ["CANCELLED", "COMPLETED"],
      },
      slotStart: {
        gte: new Date(),
      },
    },
    select: {
      id: true,
      mode: true,
      slotLabel: true,
      slotStart: true,
      paymentStatus: true,
      status: true,
    },
    orderBy: { slotStart: "asc" },
  });

  return (
    <div className="space-y-4">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">Patient Home</p>
        <h1 className="mt-1 text-lg font-bold tracking-tight text-slate-900">
          Welcome, {user.fullName}
        </h1>
        <p className="mt-1.5 max-w-2xl text-xs leading-normal text-slate-600">
          Track your next clinic appointment, payment status, and visit progress
          from one place.
        </p>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">Next appointment</p>
            <h2 className="mt-1 text-sm font-bold text-slate-900">
              {nextAppointment ? nextAppointment.slotLabel : "No upcoming appointment"}
            </h2>
          </div>
          <Link
            href={
              nextAppointment
                ? `/dashboard/appointments/${nextAppointment.id}`
                : "/dashboard/appointments/new"
            }
            className="inline-flex items-center rounded-lg bg-emerald-800 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700 active:scale-[0.98]"
          >
            {nextAppointment ? "View appointment" : "Book appointment"}
          </Link>
        </div>

        {nextAppointment ? (
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Detail label="Mode" value={nextAppointment.mode} />
            <Detail
              label="Time"
              value={nextAppointment.slotStart.toLocaleString()}
            />
            <Detail
              label="Status"
              value={nextAppointment.status.replace("_", " ")}
            />
            <Detail label="Payment" value={nextAppointment.paymentStatus} />
          </div>
        ) : (
          <p className="mt-5 rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-600">
            Book a demo appointment to choose an available doctor slot and test
            the demo payment flow.
          </p>
        )}
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">Profile Settings</p>
        <h2 className="mt-1 text-sm font-bold text-slate-900">Keep your profile current</h2>
        <p className="mt-1.5 text-xs text-slate-600">
          Full personal details are managed in profile settings, not on the home
          dashboard.
        </p>
        <Link
          href="/dashboard/profile"
          className="mt-3 inline-flex rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 active:scale-[0.98]"
        >
          Review profile
        </Link>
      </section>
    </div>
  );
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
