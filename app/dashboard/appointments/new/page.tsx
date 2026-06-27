import Link from "next/link";
import { AppointmentForm } from "./AppointmentForm";

export default function NewAppointmentPage() {
  return (
    <section className="rounded-2xl bg-white p-8 shadow-sm">
      <Link
        href="/dashboard/appointments"
        className="text-sm font-medium text-blue-600 hover:text-blue-700"
      >
        Back to appointments
      </Link>

      <div className="mt-6">
        <p className="text-sm font-medium text-blue-600">Book Appointment</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">
          Choose a demo consultation
        </h1>
        <p className="mt-3 text-sm text-slate-600">
          Pick a mode and slot. Payment is simulated after booking.
        </p>
      </div>

      <div className="mt-8 max-w-2xl">
        <AppointmentForm />
      </div>
    </section>
  );
}
