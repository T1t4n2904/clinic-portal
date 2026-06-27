import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function DoctorAppointmentsPage() {
  const appointments = await prisma.appointment.findMany({
    select: {
      id: true,
      mode: true,
      slotLabel: true,
      status: true,
      paymentStatus: true,
      patient: {
        select: {
          fullName: true,
          phone: true,
        },
      },
    },
    orderBy: { slotStart: "asc" },
  });

  return (
    <section className="rounded-2xl bg-white p-8 text-slate-900 shadow-sm">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <p className="text-sm font-medium text-blue-600">Appointments</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">
            Clinic appointments
          </h1>
        </div>
        <Link
          href="/doctor/dashboard"
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
        >
          Back to dashboard
        </Link>
      </div>

      {appointments.length === 0 ? (
        <p className="mt-8 rounded-xl border border-dashed border-slate-300 p-6 text-sm text-slate-600">
          No appointments have been booked yet.
        </p>
      ) : (
        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                <th className="py-3 pr-4">Patient</th>
                <th className="py-3 pr-4">Phone</th>
                <th className="py-3 pr-4">Mode</th>
                <th className="py-3 pr-4">Slot</th>
                <th className="py-3 pr-4">Status</th>
                <th className="py-3 pr-4">Payment</th>
                <th className="py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appointment) => (
                <tr key={appointment.id} className="border-b border-slate-100">
                  <td className="py-3 pr-4 font-medium">
                    {appointment.patient.fullName}
                  </td>
                  <td className="py-3 pr-4">{appointment.patient.phone}</td>
                  <td className="py-3 pr-4">{appointment.mode}</td>
                  <td className="py-3 pr-4">{appointment.slotLabel}</td>
                  <td className="py-3 pr-4">
                    {appointment.status.replace("_", " ")}
                  </td>
                  <td className="py-3 pr-4">{appointment.paymentStatus}</td>
                  <td className="py-3">
                    <Link
                      href={`/doctor/appointments/${appointment.id}`}
                      className="font-medium text-blue-600 hover:text-blue-700"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
