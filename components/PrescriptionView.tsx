import type { Prescription, PrescriptionMedicine } from "@prisma/client";
import { sendPrescriptionNotification } from "@/app/doctor/(protected)/appointments/[id]/actions";
import { SubmitButton } from "@/components/SubmitButton";

type PrescriptionViewProps = {
  prescription: Prescription & {
    medicines: PrescriptionMedicine[];
  };
  showDoctorActions?: boolean;
};

export function PrescriptionView({ prescription, showDoctorActions = false }: PrescriptionViewProps) {
  return (
    <div className="mt-6 space-y-4 border-t border-slate-200 pt-5 text-slate-900">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">Prescription Details</p>
          <h2 className="text-lg font-bold tracking-tight text-slate-900 mt-1">Issued Prescription</h2>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={`/api/prescription/${prescription.id}/pdf`}
            download
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition active:scale-[0.98]"
          >
            📥 Download PDF
          </a>
          <a
            href={`/dashboard/appointments/${prescription.appointmentId}/prescription/print`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition active:scale-[0.98]"
          >
            📄 Print View
          </a>

          {showDoctorActions && (
            <form action={sendPrescriptionNotification}>
              <input type="hidden" name="appointmentId" value={prescription.appointmentId} />
              <SubmitButton variant="primary" pendingText="Sending..." fullWidth={false}>
                ✉ Send Prescription
              </SubmitButton>
            </form>
          )}
        </div>
      </div>

      {prescription.medicines.length > 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-2.5 px-3">Medicine</th>
                <th className="py-2.5 px-3">Dosage</th>
                <th className="py-2.5 px-3">Frequency</th>
                <th className="py-2.5 px-3">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {prescription.medicines.map((med) => (
                <tr key={med.id} className="hover:bg-slate-50">
                  <td className="py-2 px-3">
                    <div className="font-semibold text-slate-900">{med.medicineName}</div>
                    {med.instructions && (
                      <div className="text-[10px] text-slate-500 mt-0.5">Note: {med.instructions}</div>
                    )}
                  </td>
                  <td className="py-2 px-3 text-slate-600">{med.dosage}</td>
                  <td className="py-2 px-3 text-slate-600">{med.frequency}</td>
                  <td className="py-2 px-3 text-slate-600">{med.duration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {prescription.generalAdvice && (
        <div className="rounded-lg border border-slate-200 p-3 bg-slate-50">
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">General Advice</p>
          <p className="text-xs text-slate-800 mt-1 whitespace-pre-line">{prescription.generalAdvice}</p>
        </div>
      )}

      {prescription.dietAdvice && (
        <div className="rounded-lg border border-slate-200 p-3 bg-slate-50">
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Dietary Advice (Pathya/Apathya)</p>
          <p className="text-xs text-slate-800 mt-1 whitespace-pre-line">{prescription.dietAdvice}</p>
        </div>
      )}

      {prescription.followUpDate && (
        <div className="rounded-lg border border-slate-200 p-3 bg-slate-50">
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Follow-up Date</p>
          <p className="text-xs text-slate-800 mt-1 font-semibold">
            {new Date(prescription.followUpDate).toLocaleDateString(undefined, {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      )}
    </div>
  );
}
