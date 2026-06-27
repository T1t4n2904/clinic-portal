import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requirePatient } from "@/lib/auth";

export default async function PatientAppointmentsPage() {
  const patient = await requirePatient();
  const appointments = await prisma.appointment.findMany({
    where: { patientId: patient.id },
    select: {
      id: true,
      mode: true,
      slotLabel: true,
      amount: true,
      paymentStatus: true,
      status: true,
    },
    orderBy: { slotStart: "asc" },
  });

  return (
    <section className="rounded-2xl bg-white p-8 shadow-sm">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <p className="text-sm font-medium text-blue-600">Appointments</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">
            Your appointments
          </h1>
        </div>
        <Link
          href="/dashboard/appointments/new"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 active:scale-[0.98]"
        >
          Book appointment
        </Link>
      </div>

      {appointments.length === 0 ? (
        <p className="mt-8 rounded-xl border border-dashed border-slate-300 p-6 text-sm text-slate-600">
          No appointments yet. Book a demo appointment to try the flow.
        </p>
      ) : (
        <div className="mt-8 space-y-3">
          {appointments.map((appointment) => (
            <Link
              key={appointment.id}
              href={`/dashboard/appointments/${appointment.id}`}
              className="block rounded-xl border border-slate-200 p-4 hover:bg-slate-50"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium">{appointment.slotLabel}</p>
                  <p className="text-sm text-slate-600">
                    {appointment.mode.toLowerCase()} · Rs. {appointment.amount}
                  </p>
                </div>
                <div className="text-sm text-slate-600">
                  {appointment.status.replace("_", " ")} · {appointment.paymentStatus}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
