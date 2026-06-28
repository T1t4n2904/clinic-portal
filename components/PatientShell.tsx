"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const sidebarWidth = collapsed ? "md:w-16" : "md:w-60";
  const contentMargin = collapsed ? "md:ml-16" : "md:ml-60";

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col md:flex-row">
      <aside
        className={`border-b border-slate-200 bg-white p-3 flex flex-col justify-between transition-all md:fixed md:inset-y-0 md:left-0 ${sidebarWidth} md:border-b-0 md:border-r z-40`}
      >
        <div>
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3 mb-4">
            <div className={`transition-all duration-300 ${collapsed ? "md:opacity-0 md:w-0 overflow-hidden" : "w-auto"}`}>
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-800">Clinic Portal</p>
              <p className="mt-0.5 text-[10px] text-slate-500 truncate max-w-[140px]" title={fullName}>
                {fullName}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setCollapsed((current) => !current)}
              className="hidden md:flex rounded-lg border border-slate-200 p-1 text-slate-400 hover:text-slate-700 transition hover:bg-slate-50 active:scale-[0.98]"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <span className={`inline-block text-xs transition-transform duration-300 font-bold ${collapsed ? "rotate-180" : ""}`}>
                &laquo;
              </span>
            </button>
          </div>

          <nav className="flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-visible">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={item.label}
                  className={`flex items-center whitespace-nowrap rounded-lg px-2.5 py-1.5 text-xs font-medium transition active:scale-[0.98] ${
                    collapsed ? "md:justify-center" : "gap-2.5"
                  } ${
                    isActive
                      ? "bg-emerald-50 text-emerald-950 border-l-2 border-emerald-800 pl-[8px]"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <svg
                    aria-hidden="true"
                    className="h-4.5 w-4.5 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    {item.icon}
                  </svg>
                  <span className={collapsed ? "md:hidden" : ""}>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <form action={logoutPatient} className="mt-4 md:mt-0 border-t border-slate-100 pt-3">
          <SubmitButton variant="ghost" pendingText="Leaving...">
            <span className={collapsed ? "md:hidden" : ""}>Logout</span>
            <span className={collapsed ? "hidden md:inline" : "hidden"}>Exit</span>
          </SubmitButton>
        </form>
      </aside>

      <section
        className={`flex-1 min-w-0 transition-all ${contentMargin} md:h-screen md:overflow-y-auto p-4 md:p-6 lg:p-8`}
      >
        {children}
      </section>
    </main>
  );
}
