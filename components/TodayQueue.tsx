"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { SubmitButton } from "@/components/SubmitButton";
import { updateAppointmentStatus } from "@/app/doctor/(protected)/appointments/actions";

type Patient = {
  fullName: string;
  age: number | null;
  gender: string | null;
  phone: string;
};

type Appointment = {
  id: string;
  mode: string;
  slotLabel: string;
  slotStart: Date;
  status: string;
  paymentStatus: string;
  patient: Patient;
};

type TodayQueueProps = {
  appointments: Appointment[];
};

export function TodayQueue({ appointments }: TodayQueueProps) {
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();

  const filteredAppointments = appointments.filter((app) => {
    const term = search.toLowerCase();
    return (
      app.patient.fullName.toLowerCase().includes(term) ||
      app.patient.phone.includes(term)
    );
  });

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Search today's patients by name or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-emerald-700 transition"
        />
      </div>

      {/* Queue Table */}
      <div className="rounded-lg border border-slate-200 bg-white overflow-hidden shadow-sm">
        {filteredAppointments.length === 0 ? (
          <p className="p-4 text-xs text-slate-500 text-center">No appointments match your search.</p>
        ) : (
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-2 px-3 font-semibold w-24">Time</th>
                <th className="py-2 px-3 font-semibold">Patient Name</th>
                <th className="py-2 px-3 font-semibold w-24 text-center">Mode</th>
                <th className="py-2 px-3 font-semibold w-32">Status</th>
                <th className="py-2 px-3 font-semibold w-48 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAppointments.map((app) => {
                const timeStr = new Date(app.slotStart).toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                });

                return (
                  <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                    {/* Time */}
                    <td className="py-2 px-3 text-slate-500 font-mono font-medium">
                      {timeStr}
                    </td>

                    {/* Patient Name */}
                    <td className="py-2 px-3">
                      <div className="flex flex-col">
                        <Link
                          href={`/doctor/appointments/${app.id}`}
                          className="font-semibold text-slate-900 hover:text-emerald-800 hover:underline"
                        >
                          {app.patient.fullName}
                        </Link>
                        <span className="text-[10px] text-slate-500 font-medium">
                          {[app.patient.age ? `${app.patient.age} yrs` : null, app.patient.gender]
                            .filter(Boolean)
                            .join(" / ")}{" "}
                          · {app.patient.phone}
                        </span>
                      </div>
                    </td>

                    {/* Mode */}
                    <td className="py-2 px-3 text-center">
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold border ${
                          app.mode === "ONLINE"
                            ? "bg-purple-50 text-purple-700 border-purple-100"
                            : "bg-amber-50 text-amber-700 border-amber-100"
                        }`}
                      >
                        {app.mode}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-2 px-3">
                      {renderStatusBadge(app.status, app.paymentStatus)}
                    </td>

                    {/* Actions */}
                    <td className="py-2 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {renderActionButtons(app.id, app.status)}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function renderStatusBadge(status: string, paymentStatus: string) {
  if (paymentStatus === "PENDING") {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-50 text-red-700 border border-red-100">
        Payment Pending
      </span>
    );
  }

  switch (status) {
    case "CONFIRMED":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-100">
          Waiting
        </span>
      );
    case "CHECKED_IN":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-800 border border-blue-100">
          Checked In
        </span>
      );
    case "IN_CONSULTATION":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-100 animate-pulse">
          Ongoing
        </span>
      );
    case "COMPLETED":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
          Completed
        </span>
      );
    case "CANCELLED":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-50 text-slate-400 border border-slate-200">
          Cancelled
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-50 text-slate-500 border border-slate-200">
          {status}
        </span>
      );
  }
}

function renderActionButtons(appointmentId: string, status: string) {
  const btnBase =
    "inline-flex items-center gap-1 rounded px-2 py-1 text-[10px] font-semibold border transition active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed";

  switch (status) {
    case "CONFIRMED":
      return (
        <>
          <form action={updateAppointmentStatus}>
            <input type="hidden" name="appointmentId" value={appointmentId} />
            <input type="hidden" name="action" value="CHECK_IN" />
            <input type="hidden" name="returnTo" value="/doctor/dashboard" />
            <button
              type="submit"
              title="Check in patient"
              className={`${btnBase} bg-emerald-800 border-emerald-800 text-white hover:bg-emerald-700`}
            >
              ✓ Check In
            </button>
          </form>
          <form action={updateAppointmentStatus}>
            <input type="hidden" name="appointmentId" value={appointmentId} />
            <input type="hidden" name="action" value="CANCEL" />
            <input type="hidden" name="returnTo" value="/doctor/dashboard" />
            <button
              type="submit"
              title="Cancel appointment"
              className={`${btnBase} bg-white border-slate-200 text-slate-500 hover:bg-slate-50`}
            >
              ✕
            </button>
          </form>
        </>
      );

    case "CHECKED_IN":
      return (
        <>
          <form action={updateAppointmentStatus}>
            <input type="hidden" name="appointmentId" value={appointmentId} />
            <input type="hidden" name="action" value="START_CONSULTATION" />
            <input type="hidden" name="returnTo" value="/doctor/dashboard" />
            <button
              type="submit"
              title="Start consultation"
              className={`${btnBase} bg-emerald-800 border-emerald-800 text-white hover:bg-emerald-700`}
            >
              ▶ Start
            </button>
          </form>
          <form action={updateAppointmentStatus}>
            <input type="hidden" name="appointmentId" value={appointmentId} />
            <input type="hidden" name="action" value="CANCEL" />
            <input type="hidden" name="returnTo" value="/doctor/dashboard" />
            <button
              type="submit"
              title="Cancel appointment"
              className={`${btnBase} bg-white border-slate-200 text-slate-500 hover:bg-slate-50`}
            >
              ✕
            </button>
          </form>
        </>
      );

    case "IN_CONSULTATION":
      return (
        <Link
          href={`/doctor/appointments/${appointmentId}`}
          title="Resume consultation"
          className={`${btnBase} bg-emerald-800 border-emerald-800 text-white hover:bg-emerald-700`}
        >
          🩺 Resume
        </Link>
      );

    case "COMPLETED":
      return (
        <Link
          href={`/doctor/appointments/${appointmentId}`}
          title="View consultation details"
          className={`${btnBase} bg-white border-slate-200 text-slate-700 hover:bg-slate-50`}
        >
          👁 View
        </Link>
      );

    default:
      return null;
  }
}
