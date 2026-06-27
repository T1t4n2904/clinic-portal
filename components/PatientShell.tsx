import Link from "next/link";
import type { ReactNode } from "react";
import { logoutPatient } from "@/app/dashboard/actions";

type PatientShellProps = {
  fullName: string;
  children: ReactNode;
};

export function PatientShell({ fullName, children }: PatientShellProps) {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-6xl gap-6 px-6 py-8">
        <aside className="hidden w-64 shrink-0 rounded-2xl bg-white p-5 shadow-sm md:block">
          <p className="text-sm font-semibold text-blue-600">Clinic Portal</p>
          <p className="mt-1 text-xs text-slate-500">Signed in as {fullName}</p>

          <nav className="mt-8 space-y-2 text-sm">
            <Link
              href="/dashboard"
              className="block rounded-lg px-3 py-2 font-medium text-slate-700 hover:bg-slate-100"
            >
              Home
            </Link>
            <div className="block rounded-lg px-3 py-2 text-slate-400">
              Demo Feature
            </div>
            <Link
              href="/dashboard/profile"
              className="block rounded-lg px-3 py-2 font-medium text-slate-700 hover:bg-slate-100"
            >
              Profile Settings
            </Link>
          </nav>

          <form action={logoutPatient} className="mt-8">
            <button
              type="submit"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Logout
            </button>
          </form>
        </aside>

        <section className="flex-1">{children}</section>
      </div>
    </main>
  );
}
