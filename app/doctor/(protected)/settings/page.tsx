import Link from "next/link";
import { requireDoctor } from "@/lib/auth";

export default async function DoctorSettingsPage() {
  const doctor = await requireDoctor();

  return (
    <div className="space-y-4">
      <div className="border-b border-slate-200 pb-3">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-800">System Preferences</p>
        <h1 className="mt-1 text-xl font-bold text-slate-900 tracking-tight">Doctor Settings</h1>
      </div>

      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 max-w-xl text-xs space-y-2 text-slate-900 shadow-sm">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200 pb-1 mb-2">Doctor Profile Snapshot</p>
        <div className="grid grid-cols-2 gap-y-1.5 leading-normal text-slate-700">
          <div><span className="font-semibold text-slate-500 font-mono">Name:</span> Dr. {doctor.fullName}</div>
          <div><span className="font-semibold text-slate-500 font-mono">Phone:</span> {doctor.phone}</div>
          <div className="col-span-2"><span className="font-semibold text-slate-500 font-mono">Email:</span> {doctor.email}</div>
        </div>
      </div>
      
      <div className="grid gap-4 max-w-xl">
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Doctor Timings &amp; Availability</h2>
          <p className="mt-1 text-xs text-slate-500">Configure online video consultation hours and offline physical clinic schedules.</p>
          <div className="mt-3">
            <Link
              href="/doctor/availability"
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-800 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700 active:scale-[0.98]"
            >
              Configure Availability Schedule
            </Link>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm opacity-60">
          <h2 className="text-sm font-semibold text-slate-900">System Options</h2>
          <p className="mt-1 text-xs text-slate-500">Language preferences, notification alerts, and theme selectors.</p>
        </div>
      </div>
    </div>
  );
}
