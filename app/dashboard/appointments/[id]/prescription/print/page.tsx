import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";

type PrintPageProps = {
  params: Promise<{ id: string }>;
};

export default async function PrescriptionPrintPage({ params }: PrintPageProps) {
  const { id } = await params;
  const userId = await getSessionUserId();

  if (!userId) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    redirect("/login");
  }

  const appointment = await prisma.appointment.findUnique({
    where: { id },
    include: {
      patient: {
        select: {
          fullName: true,
          age: true,
          gender: true,
          phone: true,
        },
      },
      consultation: {
        include: {
          prescription: {
            include: {
              medicines: {
                orderBy: { sortOrder: "asc" },
              },
            },
          },
        },
      },
    },
  });

  if (!appointment || !appointment.consultation || !appointment.consultation.prescription) {
    notFound();
  }

  // Security check: Only Doctor or the specific Patient can print
  if (user.role !== "DOCTOR" && appointment.patientId !== user.id) {
    redirect("/login");
  }

  const prescription = appointment.consultation.prescription;

  return (
    <div className="min-h-screen bg-white p-8 font-serif text-slate-900 max-w-4xl mx-auto border border-slate-100 shadow-sm print:border-none print:shadow-none print:p-0">
      {/* Clinic Header / Letterhead */}
      <div className="text-center border-b-2 border-emerald-800 pb-4 mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-emerald-900">AYURCLINIC & WELLNESS</h1>
        <p className="text-xs text-slate-500 mt-1">Holistic Ayurvedic Healing &amp; Panchakarma Center</p>
        <div className="mt-3 flex justify-between items-end text-xs text-slate-600 px-2">
          <div className="text-left">
            <p className="font-semibold text-slate-800">Dr. Priyadarshini Sen, B.A.M.S</p>
            <p>Senior Ayurvedic Physician</p>
          </div>
          <div className="text-right">
            <p>Contact: +91 99999 99999</p>
            <p>Email: doctor@example.com</p>
          </div>
        </div>
      </div>

      {/* Patient Information Grid */}
      <div className="grid grid-cols-2 gap-y-2 border-b border-slate-200 pb-4 mb-6 text-xs px-2">
        <div>
          <span className="font-bold text-slate-600">Patient Name:</span> {appointment.patient.fullName}
        </div>
        <div>
          <span className="font-bold text-slate-600">Date:</span> {new Date(prescription.createdAt).toLocaleDateString()}
        </div>
        <div>
          <span className="font-bold text-slate-600">Age / Gender:</span> {[appointment.patient.age ? `${appointment.patient.age} Yrs` : null, appointment.patient.gender].filter(Boolean).join(" / ") || "N/A"}
        </div>
        <div>
          <span className="font-bold text-slate-600">Appointment ID:</span> {appointment.id}
        </div>
      </div>

      {/* Diagnosis Details */}
      <div className="mb-6 px-2 text-xs">
        <h3 className="font-bold uppercase tracking-wider text-emerald-800 border-b border-emerald-50 pb-1 mb-2">Clinical Assessment</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="font-semibold text-slate-700">Chief Complaint &amp; Symptoms:</p>
            <p className="text-slate-600 mt-0.5">{appointment.consultation.chiefComplaint}. {appointment.consultation.symptoms}</p>
          </div>
          <div>
            <p className="font-semibold text-slate-700">Diagnosis (Roga Pariksha):</p>
            <p className="text-slate-600 mt-0.5">{appointment.consultation.diagnosis}</p>
          </div>
        </div>
      </div>

      {/* Prescribed Formulations */}
      {prescription.medicines.length > 0 ? (
        <div className="mb-6 px-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 border-b border-emerald-50 pb-1 mb-2">Prescribed Formulations</h3>
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-300 text-slate-600 font-bold">
                <th className="py-2 pr-4">Remedy</th>
                <th className="py-2 pr-4">Dosage</th>
                <th className="py-2 pr-4">Frequency</th>
                <th className="py-2">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {prescription.medicines.map((med) => (
                <tr key={med.id}>
                  <td className="py-2 pr-4">
                    <span className="font-semibold text-slate-900">{med.medicineName}</span>
                    {med.instructions && (
                      <span className="block text-[10px] text-slate-500 mt-0.5">Instructions: {med.instructions}</span>
                    )}
                  </td>
                  <td className="py-2 pr-4 text-slate-700">{med.dosage}</td>
                  <td className="py-2 pr-4 text-slate-700">{med.frequency}</td>
                  <td className="py-2 text-slate-700">{med.duration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {/* Lifestyle & Dietary Guidance */}
      {(prescription.generalAdvice || prescription.dietAdvice) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-200 pt-4 mb-6 px-2 text-xs">
          {prescription.generalAdvice && (
            <div>
              <h4 className="font-bold text-emerald-800">General Advice (Vihara)</h4>
              <p className="text-slate-600 mt-1 whitespace-pre-line leading-relaxed">{prescription.generalAdvice}</p>
            </div>
          )}
          {prescription.dietAdvice && (
            <div>
              <h4 className="font-bold text-emerald-800">Dietary Advice (Pathya/Apathya)</h4>
              <p className="text-slate-600 mt-1 whitespace-pre-line leading-relaxed">{prescription.dietAdvice}</p>
            </div>
          )}
        </div>
      )}

      {/* Follow Up Date */}
      {prescription.followUpDate && (
        <div className="border-t border-slate-200 pt-4 px-2 text-xs text-right">
          <span className="font-bold text-slate-600">Follow-up Date:</span>{" "}
          <span className="font-semibold text-emerald-900">
            {new Date(prescription.followUpDate).toLocaleDateString(undefined, {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>
      )}

      {/* Footer Info */}
      <div className="mt-12 text-center text-[10px] text-slate-400 border-t border-slate-100 pt-3">
        This is a digitally generated Ayurvedic prescription. No signature required.
      </div>

      {/* Automatic Print Dispatcher */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.addEventListener('DOMContentLoaded', () => {
              setTimeout(() => {
                window.print();
              }, 500);
            });
          `,
        }}
      />
    </div>
  );
}
