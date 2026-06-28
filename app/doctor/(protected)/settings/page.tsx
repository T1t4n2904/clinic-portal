import Link from "next/link";
import { requireDoctor } from "@/lib/auth";

export default async function DoctorSettingsPage() {
  await requireDoctor();

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-3">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-800">System Preferences</p>
        <h1 className="mt-1 text-xl font-bold text-slate-900 tracking-tight">Doctor Settings</h1>
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
