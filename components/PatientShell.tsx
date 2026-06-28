"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useState } from "react";
import { SubmitButton } from "@/components/SubmitButton";
import { logoutPatient } from "@/app/dashboard/actions";

type PatientShellProps = {
  fullName: string;
  children: ReactNode;
};

const navItems = [
  {
    href: "/dashboard",
    label: "Home",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 11l9-7 9 7M5 10v10h14V10M9 20v-6h6v6"
      />
    ),
  },
  {
    href: "/dashboard/appointments",
    label: "Appointments",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7 3v3m10-3v3M4 9h16M6 5h12a2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2zm2 8h3m3 0h2m-8 4h3"
      />
    ),
  },
  {
    href: "/dashboard/profile",
    label: "Profile Settings",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 12a4 4 0 100-8 4 4 0 000 8zm-7 8a7 7 0 0114 0"
      />
    ),
  },
];

export function PatientShell({ fullName, children }: PatientShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const sidebarWidth = collapsed ? "md:w-20" : "md:w-72";
  const contentMargin = collapsed ? "md:ml-20" : "md:ml-72";

  return (
    <main className="min-h-screen overflow-x-hidden bg-slate-50 text-slate-900">
      <aside
        className={`border-b border-slate-200 bg-white p-4 shadow-sm transition-all md:fixed md:inset-y-0 md:left-0 ${sidebarWidth} md:border-b-0 md:border-r md:p-5`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className={collapsed ? "md:hidden" : ""}>
            <p className="text-sm font-semibold text-blue-600">Clinic Portal</p>
            <p className="mt-1 text-xs text-slate-500">Signed in as {fullName}</p>
          </div>
          <button
            type="button"
            onClick={() => setCollapsed((current) => !current)}
            className="rounded-lg border border-slate-200 px-2 py-1 text-sm text-slate-600 transition hover:bg-slate-100 active:scale-[0.98]"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <span
              className={`inline-block transition-transform duration-300 ${
                collapsed ? "rotate-180" : ""
              }`}
            >
              &laquo;
            </span>
          </button>
        </div>

        <nav className="mt-6 flex gap-2 overflow-x-auto text-sm md:mt-8 md:block md:space-y-2 md:overflow-visible">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              className={`flex whitespace-nowrap rounded-lg px-3 py-2 font-medium text-slate-700 transition hover:bg-slate-100 active:scale-[0.98] ${
                collapsed ? "md:justify-center" : "gap-3"
              }`}
            >
              <svg
                aria-hidden="true"
                className="h-5 w-5 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                {item.icon}
              </svg>
              <span className={collapsed ? "md:hidden" : ""}>{item.label}</span>
            </Link>
          ))}
        </nav>

        <form action={logoutPatient} className="mt-8">
          <SubmitButton variant="secondary" pendingText="Logging out...">
            <span className={collapsed ? "md:hidden" : ""}>Logout</span>
            <span className={collapsed ? "hidden md:inline" : "hidden"}>Exit</span>
          </SubmitButton>
        </form>
      </aside>

      <section
        className={`min-w-0 px-4 py-6 transition-all ${contentMargin} md:h-screen md:overflow-y-auto md:px-8 md:py-8`}
      >
        {children}
      </section>
    </main>
  );
}
