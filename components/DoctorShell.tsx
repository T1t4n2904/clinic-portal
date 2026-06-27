import Link from "next/link";
import type { ReactNode } from "react";
import { logoutDoctor } from "@/app/doctor/actions";

type DoctorShellProps = {
  fullName: string;
  children: ReactNode;
};

export function DoctorShell({ fullName, children }: DoctorShellProps) {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-6xl gap-6 px-6 py-8">
        <aside className="hidden w-64 shrink-0 rounded-2xl bg-white/10 p-5 shadow-sm md:block">
          <p className="text-sm font-semibold text-blue-300">Doctor Console</p>
          <p className="mt-1 text-xs text-slate-400">Signed in as {fullName}</p>

          <nav className="mt-8 space-y-2 text-sm">
            <Link
              href="/doctor/dashboard"
              className="block rounded-lg px-3 py-2 font-medium text-slate-100 hover:bg-white/10"
            >
              Dashboard
            </Link>
            <Link
              href="/doctor/patients"
              className="block rounded-lg px-3 py-2 font-medium text-slate-100 hover:bg-white/10"
            >
              Patients
            </Link>
          </nav>

          <form action={logoutDoctor} className="mt-8">
            <button
              type="submit"
              className="w-full rounded-lg border border-white/20 px-3 py-2 text-sm font-medium text-slate-100 hover:bg-white/10"
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
