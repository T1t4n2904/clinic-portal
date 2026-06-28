import { requireDoctor } from "@/lib/auth";

export default async function DoctorReportsPage() {
  await requireDoctor();

  return (
    <div className="space-y-4">
      <div className="border-b border-slate-200 pb-3">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-800">Reports Console</p>
        <h1 className="mt-1 text-xl font-bold text-slate-900 tracking-tight">Clinic Reports</h1>
      </div>
      
      <div className="rounded-lg border border-slate-200 bg-white p-6 text-center text-slate-500">
        <svg
          className="mx-auto h-8 w-8 text-slate-300"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <h3 className="mt-3 text-sm font-semibold text-slate-900">Analytics coming soon</h3>
        <p className="mt-1 text-xs text-slate-500">Consultation statistics, demographic reports, and slot analytics are being designed.</p>
      </div>
    </div>
  );
}
