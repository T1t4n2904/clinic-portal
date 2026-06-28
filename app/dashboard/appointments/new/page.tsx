import Link from "next/link";
import { AppointmentForm } from "./AppointmentForm";

export default function NewAppointmentPage() {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 text-slate-900 shadow-sm md:p-6">
      <Link
        href="/dashboard/appointments"
        className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
      >
        ← Back
      </Link>

      <div className="mt-4 border-b border-slate-100 pb-4">
        <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">Book Appointment</p>
        <h1 className="mt-1 text-lg font-bold tracking-tight">
          Choose a demo consultation
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          Pick a mode and slot. Payment is simulated after booking.
        </p>
      </div>

      <div className="mt-8 max-w-2xl">
        <AppointmentForm />
      </div>
    </section>
  );
}
