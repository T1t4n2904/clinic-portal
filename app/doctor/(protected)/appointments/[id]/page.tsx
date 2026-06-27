import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

type DoctorAppointmentDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function DoctorAppointmentDetailPage({
  params,
}: DoctorAppointmentDetailPageProps) {
  const { id } = await params;
  const appointment = await prisma.appointment.findUnique({
    where: { id },
    include: { patient: true },
  });

  if (!appointment) {
    notFound();
  }

  return (
    <section className="rounded-2xl bg-white p-8 text-slate-900 shadow-sm">
      <Link
        href="/doctor/appointments"
        className="text-sm font-medium text-blue-600 hover:text-blue-700"
      >
        Back to appointments
      </Link>

      <div className="mt-6">
        <p className="text-sm font-medium text-blue-600">Appointment Detail</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">
          {appointment.patient.fullName}
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Demo appointment and patient contact details.
        </p>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Detail label="Patient" value={appointment.patient.fullName} />
        <Detail label="Phone" value={appointment.patient.phone} />
        <Detail label="Email" value={appointment.patient.email} />
        <Detail label="Mode" value={appointment.mode} />
        <Detail label="Slot" value={appointment.slotLabel} />
        <Detail label="Slot time" value={appointment.slotStart.toLocaleString()} />
        <Detail label="Status" value={appointment.status.replace("_", " ")} />
        <Detail label="Payment" value={appointment.paymentStatus} />
      </div>
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
