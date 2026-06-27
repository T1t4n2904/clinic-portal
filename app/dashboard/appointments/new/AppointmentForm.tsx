"use client";

import { useActionState, useEffect, useState } from "react";
import { DEMO_SLOTS } from "@/lib/appointments";
import { SubmitButton } from "@/components/SubmitButton";
import { createDemoAppointment } from "../actions";

export function AppointmentForm() {
  const [state, formAction] = useActionState(createDemoAppointment, {});
  const [mode, setMode] = useState("");
  const [slotId, setSlotId] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setErrors(state.errors || {});
  }, [state.errors]);

  return (
    <form action={formAction} className="space-y-6">
      <div>
        <p className="text-sm font-medium text-slate-700">Consultation mode</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {[
            ["ONLINE", "Online video/demo consult"],
            ["OFFLINE", "Offline clinic visit"],
          ].map(([value, label]) => (
            <label
              key={value}
              className={`rounded-xl border p-4 text-sm ${
                mode === value ? "border-blue-500 bg-blue-50" : "border-slate-200"
              }`}
            >
              <input
                className="mr-2"
                type="radio"
                name="mode"
                value={value}
                checked={mode === value}
                onChange={() => {
                  setMode(value);
                  setErrors((current) => ({ ...current, mode: "" }));
                }}
              />
              {label}
            </label>
          ))}
        </div>
        {errors.mode ? <p className="mt-2 text-sm text-red-600">{errors.mode}</p> : null}
      </div>

      <div>
        <p className="text-sm font-medium text-slate-700">Demo slot</p>
        <div className="mt-3 space-y-3">
          {DEMO_SLOTS.map((slot) => (
            <label
              key={slot.id}
              className={`block rounded-xl border p-4 text-sm ${
                slotId === slot.id ? "border-blue-500 bg-blue-50" : "border-slate-200"
              }`}
            >
              <input
                className="mr-2"
                type="radio"
                name="slotId"
                value={slot.id}
                checked={slotId === slot.id}
                onChange={() => {
                  setSlotId(slot.id);
                  setErrors((current) => ({ ...current, slotId: "" }));
                }}
              />
              {slot.label}
            </label>
          ))}
        </div>
        {errors.slotId ? (
          <p className="mt-2 text-sm text-red-600">{errors.slotId}</p>
        ) : null}
      </div>

      <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
        Demo consultation fee: <span className="font-semibold text-slate-900">Rs. 500</span>
      </div>

      <SubmitButton>Book demo appointment</SubmitButton>
    </form>
  );
}
