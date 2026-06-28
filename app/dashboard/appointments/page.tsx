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
    <section className="rounded-lg border border-slate-200 bg-white p-5 text-slate-900 shadow-sm md:p-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start border-b border-slate-100 pb-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">Appointments</p>
          <h1 className="mt-1 text-lg font-bold tracking-tight">
            Your appointments
          </h1>
        </div>
        <Link
          href="/dashboard/appointments/new"
          className="inline-flex items-center rounded-lg bg-emerald-800 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700 active:scale-[0.98]"
        >
          Book appointment
        </Link>
      </div>

      {appointments.length === 0 ? (
        <p className="mt-5 rounded-lg border border-dashed border-slate-200 p-4 text-xs text-slate-500 text-center">
          No appointments scheduled yet. Book a demo appointment to test the flow.
        </p>
      ) : (
        <div className="mt-5 space-y-2">
          {appointments.map((appointment) => (
            <Link
              key={appointment.id}
              href={`/dashboard/appointments/${appointment.id}`}
              className="block rounded-lg border border-slate-200 p-3 hover:bg-slate-50 transition hover:border-slate-300"
            >
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between text-xs">
                <div>
                  <p className="font-semibold text-slate-900">{appointment.slotLabel}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {appointment.mode.toLowerCase()} consultation · Rs. {appointment.amount}
                  </p>
                </div>
                <div className="text-[11px] font-medium text-slate-600 mt-1 sm:mt-0">
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

