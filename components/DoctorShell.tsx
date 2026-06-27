import Link from "next/link";
import type { ReactNode } from "react";
import { SubmitButton } from "@/components/SubmitButton";
import { logoutDoctor } from "@/app/doctor/actions";

type DoctorShellProps = {
  fullName: string;
  children: ReactNode;
};

export function DoctorShell({ fullName, children }: DoctorShellProps) {
  return (
    <main className="min-h-screen overflow-x-hidden bg-slate-950 text-slate-100">
      <aside className="border-b border-white/10 bg-slate-950 p-4 shadow-sm md:fixed md:inset-y-0 md:left-0 md:w-72 md:border-b-0 md:border-r md:p-5">
          <p className="text-sm font-semibold text-blue-300">Doctor Console</p>
          <p className="mt-1 text-xs text-slate-400">Signed in as {fullName}</p>

          <nav className="mt-6 flex gap-2 overflow-x-auto text-sm md:mt-8 md:block md:space-y-2 md:overflow-visible">
            <Link
              href="/doctor/dashboard"
              className="whitespace-nowrap rounded-lg px-3 py-2 font-medium text-slate-100 hover:bg-white/10 md:block"
            >
              Dashboard
            </Link>
            <Link
              href="/doctor/patients"
              className="whitespace-nowrap rounded-lg px-3 py-2 font-medium text-slate-100 hover:bg-white/10 md:block"
            >
              Patients
            </Link>
            <Link
              href="/doctor/appointments"
              className="whitespace-nowrap rounded-lg px-3 py-2 font-medium text-slate-100 hover:bg-white/10 md:block"
            >
              Appointments
            </Link>
          </nav>

          <form action={logoutDoctor} className="mt-8">
            <SubmitButton variant="secondary" pendingText="Logging out...">
              Logout
            </SubmitButton>
          </form>
      </aside>

      <section className="min-w-0 px-4 py-6 md:ml-72 md:h-screen md:overflow-y-auto md:px-8 md:py-8">
        {children}
      </section>
    </main>
  );
}
