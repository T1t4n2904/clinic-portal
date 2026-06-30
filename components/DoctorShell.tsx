"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { SubmitButton } from "@/components/SubmitButton";
import { logoutDoctor } from "@/app/doctor/actions";
import { NOTIFICATIONS_STORAGE_KEY } from "@/lib/appointments";

type DoctorShellProps = {
  fullName: string;
  children: ReactNode;
};

const navItems = [
  {
    href: "/doctor/dashboard",
    label: "Consultations",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 6h16M4 12h16M4 18h16"
      />
    ),
  },
  {
    href: "/doctor/patients",
    label: "Patients",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
      />
    ),
  },
  {
    href: "/doctor/reports",
    label: "Reports",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    ),
  },
  {
    href: "/doctor/settings",
    label: "Settings",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
      />
    ),
  },
];

export function DoctorShell({ fullName, children }: DoctorShellProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<string[]>([
    "Doctor console ready.",
    "Appointment updates will appear here.",
  ]);
  const sidebarWidth = collapsed ? "md:w-16" : "md:w-60";
  const contentMargin = collapsed ? "md:ml-16" : "md:ml-60";

  useEffect(() => {
    function loadNotifications() {
      const stored = window.localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      if (stored) {
        setNotifications(JSON.parse(stored) as string[]);
      }
    }

    loadNotifications();
    window.addEventListener("clinic:notifications", loadNotifications);
    window.addEventListener("storage", loadNotifications);

    return () => {
      window.removeEventListener("clinic:notifications", loadNotifications);
      window.removeEventListener("storage", loadNotifications);
    };
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-row">
      {/* Notifications Drawer */}
      <div className="fixed right-4 top-4 z-50">
        <button
          type="button"
          onClick={() => setNotificationsOpen((current) => !current)}
          className="relative flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 active:scale-[0.98]"
          aria-label={`${notifications.length} notifications`}
        >
          <svg
            aria-hidden="true"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h5m6 0a3 3 0 11-6 0"
            />
          </svg>
          <span className="absolute -right-1 -top-1 flex h-3.5 min-w-[14px] items-center justify-center rounded-full bg-emerald-700 px-1 text-[8px] font-bold text-white">
            {notifications.length}
          </span>
        </button>

        {notificationsOpen ? (
          <div className="absolute right-0 mt-2 w-72 rounded-xl border border-slate-200 bg-white p-3 text-slate-900 shadow-lg z-50">
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-2">
              <p className="text-xs font-semibold text-emerald-800">Notifications</p>
              <button
                type="button"
                onClick={() => setNotificationsOpen(false)}
                className="text-[11px] text-slate-500 hover:text-slate-900"
              >
                Close
              </button>
            </div>
            <div className="mt-2 max-h-60 space-y-1.5 overflow-y-auto pt-1">
              {notifications.map((notification, index) => (
                <div
                  key={`${notification}-${index}`}
                  className="rounded-lg border border-slate-100 bg-slate-50 p-2 text-xs text-slate-600 leading-normal"
                >
                  {notification}
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`h-screen sticky top-0 border-r border-slate-200 bg-white p-3 flex flex-col justify-between transition-all shrink-0 ${
          collapsed ? "w-14" : "w-14 md:w-60"
        } z-40`}
      >
        <div>
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3 mb-4">
            <div className={`transition-all duration-300 ${collapsed ? "md:opacity-0 md:w-0 overflow-hidden" : "hidden md:block"}`}>
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-800">Ayurveda Clinic</p>
              <p className="mt-0.5 text-[10px] text-slate-500 truncate max-w-[140px]" title={fullName}>
                Dr. {fullName}
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

          <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={item.label}
                  className={`flex items-center whitespace-nowrap rounded-lg px-2.5 py-1.5 text-xs font-medium transition active:scale-[0.98] ${
                    collapsed ? "justify-center" : "justify-center md:justify-start gap-2.5"
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
                  <span className={collapsed ? "hidden" : "hidden md:inline"}>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <form action={logoutDoctor} className="mt-4 border-t border-slate-100 pt-3">
          <SubmitButton variant="ghost" pendingText="Leaving...">
            <span className={collapsed ? "hidden" : "hidden md:inline"}>Logout</span>
            <span className={collapsed ? "hidden" : "inline md:hidden"}>Exit</span>
          </SubmitButton>
        </form>
      </aside>

      {/* Main Content Area */}
      <section
        className="flex-1 min-w-0 p-4 md:p-6 lg:p-8"
      >
        {children}
      </section>
    </main>
  );
}

