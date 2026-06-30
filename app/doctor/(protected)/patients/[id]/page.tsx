import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireDoctor } from "@/lib/auth";

type PatientDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function DoctorPatientDetailPage({ params }: PatientDetailPageProps) {
  await requireDoctor();
  const { id } = await params;

  const patient = await prisma.user.findFirst({
    where: { id, role: "PATIENT" },
  });

  if (!patient) {
    notFound();
  }

  const appointments = await prisma.appointment.findMany({
    where: { patientId: id },
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
    <div className="space-y-6 max-w-3xl">
      <div>
        <Link
          href="/doctor/patients"
          className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
        >
          ← Back to Patients
        </Link>
        <h1 className="mt-1 text-xl font-bold text-slate-900 tracking-tight">Patient File</h1>
      </div>

      {/* Compact Demographic Info snapshot */}
      <div className="rounded-lg border border-slate-200 bg-white p-4 text-xs space-y-2 shadow-sm">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200 pb-1 mb-2">Demographic Profile</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-slate-700 leading-normal">
          <div><span className="font-semibold text-slate-500 font-mono">Name:</span> {patient.fullName}</div>
          <div><span className="font-semibold text-slate-500 font-mono">Phone:</span> {patient.phone}</div>
          <div><span className="font-semibold text-slate-500 font-mono">Age:</span> {patient.age ? `${patient.age} yrs` : "Pending"}</div>
          <div><span className="font-semibold text-slate-500 font-mono">Gender:</span> {patient.gender || "Pending"}</div>
          <div className="md:col-span-2"><span className="font-semibold text-slate-500 font-mono">Email:</span> {patient.email}</div>
          <div className="md:col-span-2 text-[10px] text-slate-400">
            Registered: {new Date(patient.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit"
            })}
          </div>
        </div>
      </div>

      {/* Visit Timeline */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Consultation History</h2>

        {appointments.length === 0 ? (
          <p className="text-xs text-slate-500 bg-white border border-slate-200 rounded-lg p-6 text-center">
            No consultations recorded for this patient.
          </p>
        ) : (
          <div className="space-y-2">
            {appointments.map((app) => (
              <div
                key={app.id}
                className="rounded-lg border border-slate-200 bg-white p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-sm hover:bg-slate-50 transition"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{app.slotLabel}</span>
                    <span
                      className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-semibold border ${
                        app.status === "COMPLETED"
                          ? "bg-slate-50 text-slate-600 border-slate-100"
                          : app.status === "IN_CONSULTATION"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-100 animate-pulse"
                          : app.status === "CANCELLED"
                          ? "bg-red-50 text-red-700 border-red-100"
                          : "bg-amber-50 text-amber-700 border-amber-100"
                      }`}
                    >
                      {app.status.replace("_", " ")}
                    </span>
                  </div>
                  {app.consultation && (
                    <p className="text-xs text-slate-650">
                      <span className="font-semibold text-slate-500">Diagnosis:</span> {app.consultation.diagnosis}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs font-semibold">
                  <Link
                    href={`/doctor/appointments/${app.id}`}
                    className="rounded border border-slate-250 bg-white px-2.5 py-1 text-slate-700 hover:bg-slate-50 transition active:scale-[0.98]"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
