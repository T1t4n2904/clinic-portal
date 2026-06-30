"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { SubmitButton } from "@/components/SubmitButton";
import { updateAppointmentStatus } from "@/app/doctor/(protected)/appointments/actions";

type Patient = {
  id: string;
  fullName: string;
  age: number | null;
  gender: string | null;
  phone: string;
  email: string | null;
};

type Appointment = {
  id: string;
  mode: string;
  slotLabel: string;
  slotStart: string | Date;
  status: string;
  paymentStatus: string;
  patient: Patient;
};

type ConsultationsWorkspaceProps = {
  initialAppointments: Appointment[];
};

export function ConsultationsWorkspace({ initialAppointments }: ConsultationsWorkspaceProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState<"today" | "upcoming" | "all">("today");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const handleRefresh = () => {
    startTransition(() => {
      router.refresh();
    });
  };

  // 1. Filter by Date Range
  const now = new Date();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(todayStart);
  todayEnd.setDate(todayEnd.getDate() + 1);

  const dateFiltered = initialAppointments.filter((app) => {
    const slotDate = new Date(app.slotStart);
    if (dateFilter === "today") {
      return slotDate >= todayStart && slotDate < todayEnd;
    }
    if (dateFilter === "upcoming") {
      return slotDate >= now && app.status !== "COMPLETED" && app.status !== "CANCELLED";
    }
    return true; // "all"
  });

  // Compute status counts for the active date filter (excluding PAYMENT_PENDING from standard views)
  const countByStatus = (status: string) => {
    return dateFiltered.filter((app) => {
      if (app.status === "PAYMENT_PENDING") return false;
      return app.status === status;
    }).length;
  };

  const allCount = dateFiltered.filter((app) => app.status !== "PAYMENT_PENDING").length;

  // 2. Filter by Status Chip
  const statusFiltered = dateFiltered.filter((app) => {
    if (app.status === "PAYMENT_PENDING") return false; // Doctor by default does not see payment pending
    if (statusFilter === "ALL") return true;
    return app.status === statusFilter;
  });

  // 3. Search Filter (by Patient Name or Phone)
  const finalAppointments = statusFiltered.filter((app) => {
    const term = search.toLowerCase();
    return (
      app.patient.fullName.toLowerCase().includes(term) ||
      app.patient.phone.includes(term)
    );
  });

  return (
    <div className="space-y-4 max-w-5xl text-slate-900">
      {/* Search and Refresh Section */}
      <div className="flex gap-2 items-center">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search patients by name or phone number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-emerald-700 transition"
          />
        </div>
        <button
          type="button"
          onClick={handleRefresh}
          disabled={isPending}
          className="flex h-8.5 w-8.5 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-slate-700 transition hover:bg-slate-50 active:scale-[0.98] disabled:opacity-50"
          title="Refresh List"
        >
          <svg
            className={`h-4.5 w-4.5 ${isPending ? "animate-spin text-emerald-800" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89M21 3v5h-5" />
          </svg>
        </button>
      </div>

      {/* Date Filter Tabs */}
      <div className="border-b border-slate-200 flex gap-4 text-xs font-semibold">
        {(["today", "upcoming", "all"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => {
              setDateFilter(tab);
              setStatusFilter("ALL"); // Reset status chip filter on tab switch
            }}
            className={`pb-2 capitalize transition border-b-2 px-1 ${
              dateFilter === tab
                ? "border-emerald-800 text-emerald-950 font-bold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Status Filter Chips */}
      <div className="flex flex-wrap gap-1.5">
        {[
          { label: "All", value: "ALL", count: allCount },
          { label: "Confirmed", value: "CONFIRMED", count: countByStatus("CONFIRMED") },
          { label: "In Consultation", value: "IN_CONSULTATION", count: countByStatus("IN_CONSULTATION") },
          { label: "Completed", value: "COMPLETED", count: countByStatus("COMPLETED") },
          { label: "Cancelled", value: "CANCELLED", count: countByStatus("CANCELLED") },
        ].map((chip) => {
          const isActive = statusFilter === chip.value;
          return (
            <button
              key={chip.value}
              type="button"
              onClick={() => setStatusFilter(chip.value)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition duration-150 active:scale-[0.98] ${
                isActive
                  ? "border-emerald-800 bg-emerald-800 text-white scale-[1.03] shadow-sm font-bold"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              <span>{chip.label}</span>
              <span className={`text-[9px] px-1 rounded-full ${isActive ? "bg-emerald-900 text-emerald-100" : "bg-slate-100 text-slate-500"}`}>
                {chip.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Unified Table List */}
      <div className="rounded-lg border border-slate-200 bg-white overflow-hidden shadow-sm">
        {finalAppointments.length === 0 ? (
          <p className="p-8 text-xs text-slate-500 text-center">No consultations match the selected filters.</p>
        ) : (
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-2.5 px-3 font-semibold">Patient</th>
                <th className="py-2.5 px-3 font-semibold w-28">Phone</th>
                <th className="py-2.5 px-3 font-semibold w-20 text-center">Mode</th>
                <th className="py-2.5 px-3 font-semibold w-32">Slot</th>
                <th className="py-2.5 px-3 font-semibold w-24">Status</th>
                <th className="py-2.5 px-3 font-semibold w-40 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {finalAppointments.map((app) => {
                const dateStr = new Date(app.slotStart).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                });
                const timeStr = new Date(app.slotStart).toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                });

                return (
                  <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                    {/* Patient Profile Link */}
                    <td className="py-2.5 px-3">
                      <div className="flex flex-col">
                        <Link
                          href={`/doctor/patients/${app.patient.id}`}
                          className="font-semibold text-slate-900 hover:text-emerald-850 hover:underline"
                        >
                          {app.patient.fullName}
                        </Link>
                        <span className="text-[10px] text-slate-400">
                          {[app.patient.age ? `${app.patient.age} yrs` : null, app.patient.gender].filter(Boolean).join(" / ")}
                        </span>
                      </div>
                    </td>

                    {/* Phone */}
                    <td className="py-2.5 px-3 text-slate-600 font-mono">
                      {app.patient.phone}
                    </td>

                    {/* Mode */}
                    <td className="py-2.5 px-3 text-center">
                      <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-semibold border ${
                        app.mode === "ONLINE"
                          ? "bg-purple-50 text-purple-700 border-purple-100"
                          : "bg-amber-50 text-amber-700 border-amber-100"
                      }`}>
                        {app.mode}
                      </span>
                    </td>

                    {/* Slot */}
                    <td className="py-2.5 px-3">
                      <p className="font-semibold text-slate-800">{app.slotLabel}</p>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">{dateStr} at {timeStr}</p>
                    </td>

                    {/* Status badge */}
                    <td className="py-2.5 px-3">
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-semibold border ${
                        app.status === "COMPLETED"
                          ? "bg-slate-50 text-slate-600 border-slate-100"
                          : app.status === "IN_CONSULTATION"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-100 animate-pulse font-bold"
                          : app.status === "CANCELLED"
                          ? "bg-red-50 text-red-700 border-red-100"
                          : "bg-amber-50 text-amber-700 border-amber-100"
                      }`}>
                        {app.status === "CONFIRMED" ? "Confirmed" : app.status.replace("_", " ")}
                      </span>
                    </td>

                    {/* Row action button triggers */}
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {renderRowActions(app)}
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

function renderRowActions(app: Appointment) {
  const btnBase =
    "inline-flex items-center gap-1 rounded px-2 py-1 text-[10px] font-semibold border transition active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed";

  switch (app.status) {
    case "CONFIRMED":
      return (
        <>
          <form action={updateAppointmentStatus}>
            <input type="hidden" name="appointmentId" value={app.id} />
            <input type="hidden" name="action" value="START_CONSULTATION" />
            <input type="hidden" name="returnTo" value="/doctor/dashboard" />
            <button
              type="submit"
              className={`${btnBase} bg-emerald-800 border-emerald-800 text-white hover:bg-emerald-700`}
              title="Start consultation directly"
            >
              ▶ Start
            </button>
          </form>

          <form action={updateAppointmentStatus}>
            <input type="hidden" name="appointmentId" value={app.id} />
            <input type="hidden" name="action" value="CANCEL" />
            <input type="hidden" name="returnTo" value="/doctor/dashboard" />
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded p-1 border border-slate-200 bg-white text-slate-400 hover:text-red-650 hover:bg-red-50 transition active:scale-[0.98]"
              title="Cancel appointment"
            >
              ✕
            </button>
          </form>
        </>
      );

    case "IN_CONSULTATION":
      return (
        <Link
          href={`/doctor/appointments/${app.id}`}
          className={`${btnBase} bg-emerald-800 border-emerald-800 text-white hover:bg-emerald-700`}
        >
          🩺 Resume
        </Link>
      );

    default: // COMPLETED / CANCELLED
      return (
        <Link
          href={`/doctor/appointments/${app.id}`}
          className={`${btnBase} bg-white border-slate-200 text-slate-650 hover:bg-slate-50`}
        >
          👁 View
        </Link>
      );
  }
}
