"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import {
  AVAILABILITY_STORAGE_KEY,
  DEFAULT_AVAILABILITY,
  type AppointmentModeValue,
  type DemoAvailability,
  DEMO_APPOINTMENT_AMOUNT,
  generateSlotsForDate,
  getDateTitle,
  getMaxDateForAvailability,
  getTodayInputValue,
} from "@/lib/appointments";
import { SubmitButton } from "@/components/SubmitButton";
import { createDemoAppointment } from "../actions";

export function AppointmentForm() {
  const [state, formAction] = useActionState(createDemoAppointment, {});
  const [availability, setAvailability] =
    useState<DemoAvailability>(DEFAULT_AVAILABILITY);
  const [mode, setMode] = useState<AppointmentModeValue>("ONLINE");
  const [date, setDate] = useState(getTodayInputValue());
  const [slotId, setSlotId] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const stored = window.localStorage.getItem(AVAILABILITY_STORAGE_KEY);

    if (stored) {
      setAvailability(JSON.parse(stored) as DemoAvailability);
    }
  }, []);

  useEffect(() => {
    setErrors(state.errors || {});
  }, [state.errors]);

  const currentAvailability = availability[mode];
  const minDate = getTodayInputValue();
  const maxDate = getMaxDateForAvailability(currentAvailability);

  const slots = useMemo(
    () => generateSlotsForDate(mode, date, currentAvailability),
    [currentAvailability, date, mode]
  );

  function selectMode(nextMode: AppointmentModeValue) {
    setMode(nextMode);
    setSlotId("");
    setDate(getTodayInputValue());
    setErrors((current) => ({ ...current, mode: "", slotId: "" }));
  }

  function selectSlot(nextSlotId: string) {
    setSlotId((current) => (current === nextSlotId ? "" : nextSlotId));
    setErrors((current) => ({ ...current, slotId: "" }));
  }

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="mode" value={mode} />
      <input type="hidden" name="slotId" value={slotId} />

      <div>
        <p className="text-sm font-medium text-slate-700">Consultation mode</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {[
            ["ONLINE", "Online consultation"],
            ["OFFLINE", "Offline clinic visit"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => selectMode(value as AppointmentModeValue)}
              className={`rounded-xl border p-4 text-left text-sm transition active:scale-[0.98] ${
                mode === value
                  ? "border-blue-500 bg-blue-50 text-blue-800"
                  : "border-slate-200 hover:bg-slate-50"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        {errors.mode ? <p className="mt-2 text-sm text-red-600">{errors.mode}</p> : null}
      </div>

      <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
        <div>
          <label
            htmlFor="appointment-date"
            className="block text-sm font-medium text-slate-700"
          >
            Appointment date
          </label>
          <input
            id="appointment-date"
            type="date"
            min={minDate}
            max={maxDate}
            value={date}
            onChange={(event) => {
              setDate(event.target.value);
              setSlotId("");
            }}
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
          />
        </div>
        <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
          Available through <span className="font-medium text-slate-900">{maxDate}</span>
        </div>
      </div>

      <div>
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-slate-700">{getDateTitle(date)}</p>
            <p className="mt-1 text-xs text-slate-500">
              Select a {mode.toLowerCase()} slot. Click again to unselect.
            </p>
          </div>
          <p className="text-xs text-slate-500">{slots.length} slots</p>
        </div>

        {currentAvailability.notAvailable ? (
          <p className="mt-3 rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-600">
            Doctor is marked not available for {mode.toLowerCase()} appointments.
          </p>
        ) : slots.length === 0 ? (
          <p className="mt-3 rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-600">
            No available slots for this date and mode.
          </p>
        ) : (
          <div className="mt-3 flex flex-wrap gap-2">
            {slots.map((slot) => (
              <button
                key={slot.id}
                type="button"
                onClick={() => selectSlot(slot.id)}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition active:scale-[0.98] ${
                  slotId === slot.id
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                {slot.label}
              </button>
            ))}
          </div>
        )}

        {errors.slotId ? (
          <p className="mt-2 text-sm text-red-600">{errors.slotId}</p>
        ) : null}
      </div>

      <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
        Demo consultation fee:{" "}
        <span className="font-semibold text-slate-900">
          Rs. {DEMO_APPOINTMENT_AMOUNT}
        </span>
      </div>

      <SubmitButton>Book demo appointment</SubmitButton>
    </form>
  );
}
