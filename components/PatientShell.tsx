import Link from "next/link";
import type { ReactNode } from "react";
import { logoutPatient } from "@/app/dashboard/actions";

type PatientShellProps = {
  fullName: string;
  children: ReactNode;
};

export function PatientShell({ fullName, children }: PatientShellProps) {
  return (
    <main className="min-h-screen overflow-x-hidden bg-slate-50 text-slate-900">
      <aside className="border-b border-slate-200 bg-white p-4 shadow-sm md:fixed md:inset-y-0 md:left-0 md:w-72 md:border-b-0 md:border-r md:p-5">
          <p className="text-sm font-semibold text-blue-600">Clinic Portal</p>
          <p className="mt-1 text-xs text-slate-500">Signed in as {fullName}</p>

          <nav className="mt-6 flex gap-2 overflow-x-auto text-sm md:mt-8 md:block md:space-y-2 md:overflow-visible">
            <Link
              href="/dashboard"
              className="whitespace-nowrap rounded-lg px-3 py-2 font-medium text-slate-700 hover:bg-slate-100 md:block"
            >
              Home
            </Link>
            <Link
              href="/dashboard/appointments"
              className="whitespace-nowrap rounded-lg px-3 py-2 font-medium text-slate-700 hover:bg-slate-100 md:block"
            >
              Appointments
            </Link>
            <Link
              href="/dashboard/profile"
              className="whitespace-nowrap rounded-lg px-3 py-2 font-medium text-slate-700 hover:bg-slate-100 md:block"
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

      <section className="min-w-0 px-4 py-6 md:ml-72 md:h-screen md:overflow-y-auto md:px-8 md:py-8">
        {children}
      </section>
    </main>
  );
}
