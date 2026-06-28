"use client";

import { useActionState, useState } from "react";
import { SubmitButton } from "@/components/SubmitButton";
import { savePrescription, type PrescriptionActionState } from "@/app/doctor/(protected)/appointments/[id]/actions";

type PrescriptionFormProps = {
  appointmentId: string;
};

type MedicineRow = {
  id: string;
  medicineName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
};

export function PrescriptionForm({ appointmentId }: PrescriptionFormProps) {
  const [state, formAction] = useActionState(savePrescription, {});
  const [medicines, setMedicines] = useState<MedicineRow[]>([
    { id: "1", medicineName: "", dosage: "", frequency: "", duration: "", instructions: "" },
  ]);

  const addMedicine = () => {
    setMedicines([
      ...medicines,
      {
        id: Math.random().toString(36).substring(7),
        medicineName: "",
        dosage: "",
        frequency: "",
        duration: "",
        instructions: "",
      },
    ]);
  };

  const removeMedicine = (index: number) => {
    setMedicines(medicines.filter((_, idx) => idx !== index));
  };

  const updateMedicine = (index: number, field: keyof MedicineRow, value: string) => {
    const next = [...medicines];
    next[index] = { ...next[index], [field]: value };
    setMedicines(next);
  };

  return (
    <form action={formAction} className="mt-6 space-y-4 border-t border-slate-200 pt-5">
      <input type="hidden" name="appointmentId" value={appointmentId} />

      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">Add Prescription</p>
        <h2 className="text-lg font-bold tracking-tight text-slate-900 mt-1">Create Patient Prescription</h2>
        <p className="text-xs text-slate-500">Provide Ayurvedic formulations, general recommendations, and follow-up guidance.</p>
      </div>

      {state.message ? (
        <p className="rounded-lg bg-red-50 border border-red-100 px-4 py-2.5 text-xs text-red-700">
          {state.message}
        </p>
      ) : null}

      <div className="space-y-3">
        <label className="block text-xs font-bold uppercase tracking-wide text-slate-500">
          Medicines
        </label>
        
        {medicines.map((med, idx) => (
          <div key={med.id} className="relative rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-2">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-bold text-slate-400">Medicine #{idx + 1}</span>
              {medicines.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeMedicine(idx)}
                  className="text-xs font-semibold text-red-600 hover:text-red-700"
                >
                  ✕ Remove
                </button>
              )}
            </div>

            <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-4">
              <div className="space-y-1 sm:col-span-2 md:col-span-1">
                <label className="block text-[10px] font-bold text-slate-500">Medicine Name</label>
                <input
                  type="text"
                  name="medicineName"
                  value={med.medicineName}
                  onChange={(e) => updateMedicine(idx, "medicineName", e.target.value)}
                  placeholder="e.g. Triphala Churna"
                  className="w-full rounded border border-slate-300 px-2 py-1 text-xs outline-none focus:border-emerald-800 bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-500">Dosage</label>
                <input
                  type="text"
                  name="dosage"
                  value={med.dosage}
                  onChange={(e) => updateMedicine(idx, "dosage", e.target.value)}
                  placeholder="e.g. 1 tsp / 2 tabs"
                  className="w-full rounded border border-slate-300 px-2 py-1 text-xs outline-none focus:border-emerald-800 bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-500">Frequency</label>
                <input
                  type="text"
                  name="frequency"
                  value={med.frequency}
                  onChange={(e) => updateMedicine(idx, "frequency", e.target.value)}
                  placeholder="e.g. Twice daily post meals"
                  className="w-full rounded border border-slate-300 px-2 py-1 text-xs outline-none focus:border-emerald-800 bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-500">Duration</label>
                <input
                  type="text"
                  name="duration"
                  value={med.duration}
                  onChange={(e) => updateMedicine(idx, "duration", e.target.value)}
                  placeholder="e.g. 15 days / 1 month"
                  className="w-full rounded border border-slate-300 px-2 py-1 text-xs outline-none focus:border-emerald-800 bg-white"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-500">Specific Instructions (optional)</label>
              <input
                type="text"
                name="instructions"
                value={med.instructions}
                onChange={(e) => updateMedicine(idx, "instructions", e.target.value)}
                placeholder="e.g. take with warm water or honey"
                className="w-full rounded border border-slate-300 px-2 py-1 text-xs outline-none focus:border-emerald-800 bg-white"
              />
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addMedicine}
          className="inline-flex items-center gap-1 rounded border border-dashed border-slate-300 bg-white hover:bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition"
        >
          ＋ Add Medicine Row
        </button>
      </div>

      <div className="space-y-1">
        <label htmlFor="generalAdvice" className="block text-xs font-bold uppercase tracking-wide text-slate-500 mt-2">
          General Advice
        </label>
        <textarea
          id="generalAdvice"
          name="generalAdvice"
          rows={2}
          placeholder="Enter lifestyle or therapeutic advice..."
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs outline-none focus:border-emerald-800 bg-white"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="dietAdvice" className="block text-xs font-bold uppercase tracking-wide text-slate-500 mt-2">
          Dietary Advice (Pathya/Apathya)
        </label>
        <textarea
          id="dietAdvice"
          name="dietAdvice"
          rows={2}
          placeholder="Foods to prefer or avoid..."
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs outline-none focus:border-emerald-800 bg-white"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="followUpDate" className="block text-xs font-bold uppercase tracking-wide text-slate-500 mt-2">
          Follow-up Date <span className="text-slate-400 font-normal">(optional)</span>
        </label>
        <input
          id="followUpDate"
          name="followUpDate"
          type="date"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs outline-none focus:border-emerald-800 bg-white"
        />
      </div>

      <div className="pt-2">
        <SubmitButton pendingText="Creating Prescription...">
          Create &amp; Issue Prescription
        </SubmitButton>
      </div>
    </form>
  );
}
