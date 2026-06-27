import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requirePatient } from "@/lib/auth";
import { demoPayAppointment } from "../actions";

type AppointmentDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ paid?: string }>;
};

export default async function PatientAppointmentDetailPage({
  params,
  searchParams,
}: AppointmentDetailPageProps) {
  const patient = await requirePatient();
  const { id } = await params;
  const query = await searchParams;
  const appointment = await prisma.appointment.findFirst({
    where: {
      id,
      patientId: patient.id,
    },
  });

  if (!appointment) {
    notFound();
  }

  const canPay = appointment.paymentStatus === "PENDING";

  return (
    <section className="rounded-2xl bg-white p-8 shadow-sm">
      <Link
        href="/dashboard/appointments"
        className="text-sm font-medium text-blue-600 hover:text-blue-700"
      >
        Back to appointments
      </Link>

      {query.paid === "1" ? (
        <p className="mt-6 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Demo payment successful. Your appointment is confirmed.
        </p>
      ) : null}

      <div className="mt-6">
        <p className="text-sm font-medium text-blue-600">Appointment Detail</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">
          {appointment.slotLabel}
        </h1>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Detail label="Mode" value={appointment.mode} />
        <Detail label="Slot" value={appointment.slotStart.toLocaleString()} />
        <Detail label="Amount" value={`₹${appointment.amount}`} />
        <Detail label="Payment" value={appointment.paymentStatus} />
        <Detail label="Status" value={appointment.status.replace("_", " ")} />
      </div>

      {canPay ? (
        <form action={demoPayAppointment} className="mt-8">
          <input type="hidden" name="appointmentId" value={appointment.id} />
          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700"
          >
            Demo Pay ₹{appointment.amount}
          </button>
        </form>
      ) : (
        <p className="mt-8 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
          Payment is complete. This demo appointment is confirmed.
        </p>
      )}
    </section>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium">{value}</p>
    </div>
  );
}
