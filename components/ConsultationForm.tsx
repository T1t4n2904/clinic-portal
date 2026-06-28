"use client";

import { useActionState } from "react";
import { SubmitButton } from "@/components/SubmitButton";
import { saveConsultation, type ConsultationActionState } from "@/app/doctor/(protected)/appointments/[id]/actions";

type ConsultationFormProps = {
  appointmentId: string;
};

export function ConsultationForm({ appointmentId }: ConsultationFormProps) {
  const [state, formAction] = useActionState(saveConsultation, {});

  return (
    <form action={formAction} className="mt-6 space-y-4">
      <input type="hidden" name="appointmentId" value={appointmentId} />

      <h2 className="text-lg font-semibold text-slate-900">Add Consultation Notes</h2>

      {state.message ? (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.message}
        </p>
      ) : null}

      <div className="space-y-1">
        <label htmlFor="chiefComplaint" className="block text-sm font-medium text-slate-700">
          Chief Complaint
        </label>
        <textarea
          id="chiefComplaint"
          name="chiefComplaint"
          rows={2}
          required
          className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-blue-500 ${
            state.errors?.chiefComplaint ? "border-red-300" : "border-slate-300"
          }`}
        />
        {state.errors?.chiefComplaint ? (
          <p className="text-sm text-red-600">{state.errors.chiefComplaint}</p>
        ) : null}
      </div>

      <div className="space-y-1">
        <label htmlFor="symptoms" className="block text-sm font-medium text-slate-700">
          Symptoms
        </label>
        <textarea
          id="symptoms"
          name="symptoms"
          rows={2}
          required
          className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-blue-500 ${
            state.errors?.symptoms ? "border-red-300" : "border-slate-300"
          }`}
        />
        {state.errors?.symptoms ? (
          <p className="text-sm text-red-600">{state.errors.symptoms}</p>
        ) : null}
      </div>

      <div className="space-y-1">
        <label htmlFor="diagnosis" className="block text-sm font-medium text-slate-700">
          Diagnosis
        </label>
        <textarea
          id="diagnosis"
          name="diagnosis"
          rows={2}
          required
          className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-blue-500 ${
            state.errors?.diagnosis ? "border-red-300" : "border-slate-300"
          }`}
        />
        {state.errors?.diagnosis ? (
          <p className="text-sm text-red-600">{state.errors.diagnosis}</p>
        ) : null}
      </div>

      <div className="space-y-1">
        <label htmlFor="advice" className="block text-sm font-medium text-slate-700">
          Advice
        </label>
        <textarea
          id="advice"
          name="advice"
          rows={2}
          required
          className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-blue-500 ${
            state.errors?.advice ? "border-red-300" : "border-slate-300"
          }`}
        />
        {state.errors?.advice ? (
          <p className="text-sm text-red-600">{state.errors.advice}</p>
        ) : null}
      </div>

      <div className="space-y-1">
        <label htmlFor="followUpDate" className="block text-sm font-medium text-slate-700">
          Follow-up Date <span className="text-slate-400">(optional)</span>
        </label>
        <input
          id="followUpDate"
          name="followUpDate"
          type="date"
          className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-blue-500 ${
            state.errors?.followUpDate ? "border-red-300" : "border-slate-300"
          }`}
        />
        {state.errors?.followUpDate ? (
          <p className="text-sm text-red-600">{state.errors.followUpDate}</p>
        ) : null}
      </div>

      <SubmitButton pendingText="Saving consultation...">
        Save Consultation &amp; Complete Appointment
      </SubmitButton>
    </form>
  );
}
