"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AVAILABILITY_STORAGE_KEY,
  DEFAULT_AVAILABILITY,
  type AppointmentModeValue,
  type DemoAvailability,
  formatMinutes,
  generateSlotsForDate,
  getDateTitle,
  getMaxDateForAvailability,
  getTodayInputValue,
  minutesFromTimeValue,
  NOTIFICATIONS_STORAGE_KEY,
  timeValueFromMinutes,
  type IntervalPreset,
} from "@/lib/appointments";

const RANGE_OPTIONS = [
  { label: "One day", value: 1 },
  { label: "7 days", value: 7 },
  { label: "15 days", value: 15 },
  { label: "30 days", value: 30 },
];

const INTERVAL_OPTIONS: Array<{ label: string; value: IntervalPreset }> = [
  { label: "Every 5 min", value: "5" },
  { label: "Every 10 min", value: "10" },
  { label: "Every 15 min", value: "15" },
  { label: "Custom", value: "CUSTOM" },
];

export default function DoctorAvailabilityPage() {
  const [availability, setAvailability] =
    useState<DemoAvailability>(DEFAULT_AVAILABILITY);
  const [mode, setMode] = useState<AppointmentModeValue>("ONLINE");
  const [previewDate, setPreviewDate] = useState(getTodayInputValue());
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [pendingNotification, setPendingNotification] = useState(
    "Saved doctor availability."
  );

  useEffect(() => {
    const stored = window.localStorage.getItem(AVAILABILITY_STORAGE_KEY);

    if (stored) {
      setAvailability(JSON.parse(stored) as DemoAvailability);
    }
  }, []);

  const current = availability[mode];
  const maxDate = getMaxDateForAvailability(current);
  const maxCustomInterval = Math.max(5, current.endMinutes - current.startMinutes);
  const safeCustomInterval = Math.max(
    5,
    Math.min(current.customInterval, maxCustomInterval)
  );
  const customHours = Math.floor(safeCustomInterval / 60);
  const customMinutes = safeCustomInterval % 60;
  const slots = useMemo(
    () =>
      generateSlotsForDate(mode, previewDate, {
        ...current,
        unavailableSlots: [],
      }),
    [current, mode, previewDate]
  );

  function logEvent(message: string) {
    const stored = window.localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    const currentEvents = stored ? (JSON.parse(stored) as string[]) : [];
    const nextEvents = [message, ...currentEvents].slice(0, 8);

    window.localStorage.setItem(
      NOTIFICATIONS_STORAGE_KEY,
      JSON.stringify(nextEvents)
    );
    window.dispatchEvent(new Event("clinic:notifications"));
  }

  function updateModeAvailability(
    modeKey: AppointmentModeValue,
    changes: Partial<DemoAvailability[AppointmentModeValue]>,
    eventMessage: string
  ) {
    setAvailability((currentAvailability) => ({
      ...currentAvailability,
      [modeKey]: {
        ...currentAvailability[modeKey],
        ...changes,
      },
    }));
    setHasUnsavedChanges(true);
    setPendingNotification(eventMessage);
  }

  function saveAvailability() {
    window.localStorage.setItem(
      AVAILABILITY_STORAGE_KEY,
      JSON.stringify(availability)
    );
    logEvent(pendingNotification);
    setHasUnsavedChanges(false);
  }

  function updateRange(which: "startMinutes" | "endMinutes", value: number) {
    const safeValue =
      which === "startMinutes"
        ? Math.min(value, current.endMinutes - 5)
        : Math.max(value, current.startMinutes + 5);

    updateModeAvailability(
      mode,
      { [which]: safeValue },
      `Set ${mode.toLowerCase()} ${which === "startMinutes" ? "start" : "end"} time to ${formatMinutes(safeValue)}.`
    );
  }

  function updateCustomInterval(hours: number, minutes: number) {
    const rawValue = Math.max(0, hours) * 60 + Math.max(0, minutes);
    const safeValue = Math.max(5, Math.min(rawValue, maxCustomInterval));

    updateModeAvailability(
      mode,
      { customInterval: safeValue },
      `Set ${mode.toLowerCase()} custom interval to ${Math.floor(
        safeValue / 60
      )}h ${safeValue % 60}m.`
    );
  }

  function toggleSlotUnavailable(slotId: string, label: string) {
    const exists = current.unavailableSlots.includes(slotId);
    const unavailableSlots = exists
      ? current.unavailableSlots.filter((item) => item !== slotId)
      : [...current.unavailableSlots, slotId];

    updateModeAvailability(
      mode,
      { unavailableSlots },
      exists
        ? `Restored ${mode.toLowerCase()} slot ${label} on ${previewDate}.`
        : `Set NA for ${label} on ${previewDate}.`
    );
  }

  const rangeLeft = (current.startMinutes / 1440) * 100;
  const rangeRight = 100 - (current.endMinutes / 1440) * 100;

  return (
    <div>
      <section className="rounded-xl bg-white p-5 text-slate-900 shadow-sm md:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium text-blue-600">Availability</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight">
              Set doctor timings
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Configure online and offline availability separately. Save changes
              when the schedule is ready for patients.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`text-xs font-medium ${
                hasUnsavedChanges ? "text-amber-700" : "text-emerald-700"
              }`}
            >
              {hasUnsavedChanges ? "Unsaved changes" : "Saved"}
            </span>
            <button
              type="button"
              onClick={saveAvailability}
              disabled={!hasUnsavedChanges}
              className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              Save availability
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          {[
            ["ONLINE", "Online appointments"],
            ["OFFLINE", "Offline clinic visits"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => {
                setMode(value as AppointmentModeValue);
                setPreviewDate(getTodayInputValue());
              }}
              className={`rounded-lg border px-3 py-2.5 text-left text-sm transition active:scale-[0.98] ${
                mode === value
                  ? "border-blue-500 bg-blue-50 text-blue-800"
                  : "border-slate-200 hover:bg-slate-50"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mt-5 rounded-xl border border-slate-200 p-4">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-base font-semibold">{mode} availability</h2>
              <p className="mt-1 text-sm text-slate-500">
                {formatMinutes(current.startMinutes)} to{" "}
                {formatMinutes(current.endMinutes)}
              </p>
            </div>
            <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                checked={current.notAvailable}
                onChange={(event) =>
                  updateModeAvailability(
                    mode,
                    { notAvailable: event.target.checked },
                    event.target.checked
                      ? `Marked ${mode.toLowerCase()} not available.`
                      : `Marked ${mode.toLowerCase()} available.`
                  )
                }
              />
              Not available
            </label>
          </div>

          <div className="mt-4 space-y-4">
            <fieldset
              disabled={current.notAvailable}
              className={current.notAvailable ? "opacity-40" : ""}
            >
              <div className="flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
                <span className="font-medium text-slate-700">
                  Time range: lower handle is start, upper handle is end
                </span>
                <div className="flex gap-2">
                  <input
                    type="time"
                    value={timeValueFromMinutes(current.startMinutes)}
                    onChange={(event) =>
                      updateRange(
                        "startMinutes",
                        minutesFromTimeValue(event.target.value)
                      )
                    }
                    className="rounded-lg border border-slate-300 px-2 py-1 text-sm"
                    aria-label="Start time"
                  />
                  <input
                    type="time"
                    value={timeValueFromMinutes(current.endMinutes)}
                    onChange={(event) =>
                      updateRange(
                        "endMinutes",
                        minutesFromTimeValue(event.target.value)
                      )
                    }
                    className="rounded-lg border border-slate-300 px-2 py-1 text-sm"
                    aria-label="End time"
                  />
                </div>
              </div>
              <div className="relative mt-4 h-7">
                <div className="absolute left-0 right-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-slate-200" />
                <div
                  className="absolute top-1/2 h-2 -translate-y-1/2 rounded-full bg-blue-500"
                  style={{ left: `${rangeLeft}%`, right: `${rangeRight}%` }}
                />
                <input
                  type="range"
                  min={0}
                  max={1435}
                  step={5}
                  value={current.startMinutes}
                  onChange={(event) =>
                    updateRange("startMinutes", Number(event.target.value))
                  }
                  className="pointer-events-none absolute inset-0 h-7 w-full appearance-none bg-transparent accent-blue-600 [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:relative [&::-webkit-slider-thumb]:z-20"
                  aria-label="Start time range handle"
                />
                <input
                  type="range"
                  min={5}
                  max={1440}
                  step={5}
                  value={current.endMinutes}
                  onChange={(event) =>
                    updateRange("endMinutes", Number(event.target.value))
                  }
                  className="pointer-events-none absolute inset-0 h-7 w-full appearance-none bg-transparent accent-blue-600 [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:relative [&::-webkit-slider-thumb]:z-30"
                  aria-label="End time range handle"
                />
              </div>
              <div className="mt-2 flex justify-between text-xs text-slate-500">
                <span>{formatMinutes(current.startMinutes)}</span>
                <span>{formatMinutes(current.endMinutes)}</span>
              </div>
            </fieldset>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm font-medium text-slate-700">
                Set for
                <select
                  value={current.rangeDays}
                  onChange={(event) =>
                    updateModeAvailability(
                      mode,
                      { rangeDays: Number(event.target.value) },
                      `Set ${mode.toLowerCase()} availability range to ${event.target.value} day(s).`
                    )
                  }
                  className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                >
                  {RANGE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label
                className={`text-sm font-medium text-slate-700 ${
                  current.notAvailable ? "opacity-40" : ""
                }`}
              >
                Time slot intervals
                <select
                  disabled={current.notAvailable}
                  value={current.intervalPreset}
                  onChange={(event) =>
                    updateModeAvailability(
                      mode,
                      { intervalPreset: event.target.value as IntervalPreset },
                      `Set ${mode.toLowerCase()} interval to ${event.target.value}.`
                    )
                  }
                  className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                >
                  {INTERVAL_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {current.intervalPreset === "CUSTOM" ? (
              <fieldset
                disabled={current.notAvailable}
                className={`rounded-lg border border-slate-200 p-3 ${
                  current.notAvailable ? "opacity-40" : ""
                }`}
              >
                <p className="text-sm font-medium text-slate-700">
                  Custom interval
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Minimum 5 minutes. Maximum currently {Math.floor(maxCustomInterval / 60)}h{" "}
                  {maxCustomInterval % 60}m based on the selected time range.
                </p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <label className="text-sm font-medium text-slate-700">
                    HH
                    <input
                      type="number"
                      min={0}
                      max={Math.floor(maxCustomInterval / 60)}
                      value={customHours}
                      onChange={(event) =>
                        updateCustomInterval(Number(event.target.value), customMinutes)
                      }
                      className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    />
                  </label>
                  <label className="text-sm font-medium text-slate-700">
                    Minutes
                    <input
                      type="number"
                      min={0}
                      max={59}
                      step={5}
                      value={customMinutes}
                      onChange={(event) =>
                        updateCustomInterval(customHours, Number(event.target.value))
                      }
                      className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    />
                  </label>
                </div>
              </fieldset>
            ) : null}
          </div>
        </div>

        <div
          className={`mt-5 rounded-xl border border-slate-200 p-4 ${
            current.notAvailable ? "opacity-40" : ""
          }`}
        >
          <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
            <div>
              <label
                htmlFor="preview-date"
                className="block text-sm font-medium text-slate-700"
              >
                Preview and edit slots
              </label>
              <input
                id="preview-date"
                type="date"
                min={getTodayInputValue()}
                max={maxDate}
                value={previewDate}
                disabled={current.notAvailable}
                onChange={(event) => setPreviewDate(event.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
              {getDateTitle(previewDate)}
            </div>
          </div>

          {current.notAvailable ? (
            <p className="mt-4 rounded-lg border border-dashed border-slate-300 p-3 text-sm text-slate-600">
              This mode is currently marked not available.
            </p>
          ) : slots.length === 0 ? (
            <p className="mt-4 rounded-lg border border-dashed border-slate-300 p-3 text-sm text-slate-600">
              No slots generated for this date.
            </p>
          ) : (
            <div className="mt-4 flex flex-wrap gap-2">
              {slots.map((slot) => {
                const isUnavailable = current.unavailableSlots.includes(slot.id);

                return (
                  <button
                    key={slot.id}
                    type="button"
                    disabled={current.notAvailable}
                    onClick={() => toggleSlotUnavailable(slot.id, slot.label)}
                    className={`rounded-full border px-3 py-1.5 text-sm font-medium transition active:scale-[0.98] ${
                      isUnavailable
                        ? "border-red-300 bg-red-50 text-red-700"
                        : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {slot.label}
                    {isUnavailable ? " NA" : ""}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
