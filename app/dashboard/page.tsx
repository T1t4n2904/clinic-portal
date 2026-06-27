import Link from "next/link";
import { requirePatient } from "@/lib/auth";

export default async function DashboardPage() {
  const user = await requirePatient();

  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-white p-8 shadow-sm">
        <p className="text-sm font-medium text-blue-600">Patient Home</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">
          Welcome, {user.fullName}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          Your clinic portal account is active. This dashboard will become the
          hub for appointments, clinic updates, and patient services.
        </p>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Portal Status
          </p>
          <h2 className="mt-3 text-xl font-semibold">Account verified</h2>
          <p className="mt-2 text-sm text-slate-600">
            Your phone number is verified and your patient profile is ready.
          </p>
          <Link
            href="/dashboard/profile"
            className="mt-5 inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Review profile
          </Link>
        </section>

        <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Demo Feature
          </p>
          <h2 className="mt-3 text-xl font-semibold">Book a demo appointment</h2>
          <p className="mt-2 text-sm text-slate-600">
            Try the demo booking and payment flow. Choose a slot, create an
            appointment, and confirm it with the demo payment button.
          </p>
          <Link
            href="/dashboard/appointments/new"
            className="mt-5 inline-flex rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Book appointment
          </Link>
        </section>
      </div>
    </div>
  );
}
