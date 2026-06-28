"use client";

import Link from "next/link";
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
    label: "Dashboard",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 13h6V4H4v9zm10 7h6V4h-6v16zM4 20h6v-3H4v3z"
      />
    ),
  },
  {
    href: "/doctor/appointments",
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
    href: "/doctor/availability",
    label: "Availability",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6v6l4 2m5-2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    ),
  },
];

export function DoctorShell({ fullName, children }: DoctorShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<string[]>([
    "Doctor console ready.",
    "Appointment updates will appear here.",
  ]);
  const sidebarWidth = collapsed ? "md:w-20" : "md:w-72";
  const contentMargin = collapsed ? "md:ml-20" : "md:ml-72";

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
    <main className="min-h-screen overflow-x-hidden bg-slate-950 text-slate-100">
      <div className="fixed right-3 top-3 z-50 md:right-5">
        <button
          type="button"
          onClick={() => setNotificationsOpen((current) => !current)}
          className="relative flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-slate-900 text-slate-100 shadow-md transition hover:bg-slate-800 active:scale-[0.98]"
          aria-label={`${notifications.length} notifications`}
        >
          <svg
            aria-hidden="true"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h5m6 0a3 3 0 11-6 0"
            />
          </svg>
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
            {notifications.length}
          </span>
        </button>

        {notificationsOpen ? (
          <div className="absolute right-0 mt-2 w-72 rounded-xl border border-slate-200 bg-white p-3 text-slate-900 shadow-xl">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-blue-600">Notifications</p>
              <button
                type="button"
                onClick={() => setNotificationsOpen(false)}
                className="text-sm text-slate-500 hover:text-slate-900"
              >
                Close
              </button>
            </div>
            <div className="mt-3 max-h-72 space-y-2 overflow-y-auto">
              {notifications.map((notification, index) => (
                <div
                  key={`${notification}-${index}`}
                  className="rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-sm text-slate-700"
                >
                  {notification}
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <aside
        className={`border-b border-white/10 bg-slate-950 p-4 shadow-sm transition-all md:fixed md:inset-y-0 md:left-0 ${sidebarWidth} md:border-b-0 md:border-r md:p-5`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className={collapsed ? "md:hidden" : ""}>
            <p className="text-sm font-semibold text-blue-300">Doctor Console</p>
            <p className="mt-1 text-xs text-slate-400">Signed in as {fullName}</p>
          </div>
          <button
            type="button"
            onClick={() => setCollapsed((current) => !current)}
            className="rounded-lg border border-white/10 px-2 py-1 text-sm text-slate-200 transition hover:bg-white/10 active:scale-[0.98]"
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
              className={`flex whitespace-nowrap rounded-lg px-3 py-2 font-medium text-slate-100 transition hover:bg-white/10 active:scale-[0.98] ${
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

        <form action={logoutDoctor} className="mt-8">
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
