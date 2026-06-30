import Link from "next/link";
import { requirePatient } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function PatientConsultationsPage() {
  const patient = await requirePatient();

  const appointments = await prisma.appointment.findMany({
    where: {
      patientId: patient.id,
      status: "COMPLETED",
      consultation: { isNot: null },
    },
    include: {
      consultation: {
        include: {
          prescription: true,
        },
      },
    },
    orderBy: { slotStart: "desc" },
  });

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 text-slate-900 shadow-sm md:p-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start border-b border-slate-100 pb-4">
        <div>
          <Link
            href="/dashboard"
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
          >
            ← Back
          </Link>
          <h1 className="mt-1 text-lg font-bold tracking-tight">
            Consultation History
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Access summaries and download prescriptions from your past clinic sessions.
          </p>
        </div>
      </div>

      {appointments.length === 0 ? (
        <p className="mt-5 rounded-lg border border-dashed border-slate-200 p-8 text-xs text-slate-500 text-center">
          No completed consultations found in your history yet.
        </p>
      ) : (
        <div className="mt-5 space-y-3">
          {appointments.map((app) => {
            const hasPrescription = !!app.consultation?.prescription;
            return (
              <div
                key={app.id}
                className="rounded-lg border border-slate-200 p-4 bg-slate-50 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
              >
                <div className="space-y-1">
                  <p className="text-xs font-bold text-emerald-800">{app.slotLabel}</p>
                  <p className="text-xs text-slate-700">
                    <span className="font-semibold">Diagnosis:</span> {app.consultation?.diagnosis || "N/A"}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    <span className="font-medium">Chief Complaint:</span> {app.consultation?.chiefComplaint || "N/A"}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 text-xs font-semibold">
                  <Link
                    href={`/dashboard/appointments/${app.id}`}
                    className="inline-flex items-center rounded border border-slate-250 bg-white px-2.5 py-1 text-xs text-slate-700 hover:bg-slate-50 transition active:scale-[0.98]"
                  >
                    View Appointment
                  </Link>

                  {hasPrescription && (
                    <>
                      <Link
                        href={`/dashboard/appointments/${app.id}`}
                        className="inline-flex items-center rounded border border-emerald-800 bg-emerald-800 px-2.5 py-1 text-xs text-white hover:bg-emerald-700 transition active:scale-[0.98]"
                      >
                        View Prescription
                      </Link>
                      <a
                        href={`/dashboard/appointments/${app.id}/prescription/print`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded border border-slate-250 bg-white px-2.5 py-1 text-xs text-slate-700 hover:bg-slate-50 transition active:scale-[0.98]"
                      >
                        📄 Download PDF
                      </a>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
