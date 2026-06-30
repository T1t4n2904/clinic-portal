"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useState } from "react";
import { SubmitButton } from "@/components/SubmitButton";
import { logoutPatient } from "@/app/dashboard/actions";

type NotificationEntry = {
  id: string;
  type: string;
  message: string;
  status: string;
  createdAt: Date;
  appointmentId: string | null;
};

type PatientShellProps = {
  fullName: string;
  notifications?: NotificationEntry[];
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

export function PatientShell({ fullName, notifications = [], children }: PatientShellProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [showToast, setShowToast] = useState(() => {
    const latestReady = notifications.find((n) => n.type === "PRESCRIPTION_READY");
    return !!latestReady;
  });

  const latestPrescriptionReadyNotification = notifications.find((n) => n.type === "PRESCRIPTION_READY");
  const sidebarWidth = collapsed ? "md:w-16" : "md:w-60";
  const contentMargin = collapsed ? "md:ml-16" : "md:ml-60";

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
            className="h-4.5 w-4.5"
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
          {notifications.length > 0 && (
            <span className="absolute -right-1 -top-1 flex h-3.5 min-w-[14px] items-center justify-center rounded-full bg-emerald-700 px-1 text-[8px] font-bold text-white">
              {notifications.length}
            </span>
          )}
        </button>

        {notificationsOpen ? (
          <div className="absolute right-0 mt-2 w-72 rounded-xl border border-slate-200 bg-white p-3 text-slate-900 shadow-lg z-50">
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-2">
              <p className="text-xs font-semibold text-emerald-800">Notifications</p>
              <button
                type="button"
                onClick={() => setNotificationsOpen(false)}
                className="text-[11px] text-slate-500 hover:text-slate-955 font-semibold"
              >
                Close
              </button>
            </div>
            <div className="mt-2 max-h-60 space-y-1.5 overflow-y-auto pt-1">
              {notifications.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">No notifications yet.</p>
              ) : (
                notifications.map((log) => (
                  <div
                    key={log.id}
                    className="rounded-lg border border-slate-100 bg-slate-50 p-2 text-xs text-slate-600 leading-normal"
                  >
                    <p className="font-bold text-slate-800">{log.type.replace("_", " ")}</p>
                    <p className="mt-0.5 text-[11px] text-slate-500 leading-normal">{log.message}</p>
                    {log.appointmentId && (
                      <Link
                        href={
                          log.type === "PRESCRIPTION_READY"
                            ? `/dashboard/appointments/${log.appointmentId}/prescription/print`
                            : `/dashboard/appointments/${log.appointmentId}`
                        }
                        onClick={() => setNotificationsOpen(false)}
                        className="mt-1.5 inline-block text-[10px] font-bold text-emerald-800 hover:underline"
                      >
                        {log.type === "PRESCRIPTION_READY" ? "View Prescription" : "View Appointment"}
                      </Link>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        ) : null}
      </div>

      {showToast && latestPrescriptionReadyNotification && (
        <div className="fixed bottom-4 right-4 z-50 max-w-sm rounded-lg border border-emerald-200 bg-white p-4 text-slate-900 shadow-lg animate-in slide-in-from-bottom duration-300">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-emerald-800">Prescription Ready</p>
              <p className="mt-1 text-xs text-slate-600">Your prescription is ready. You can view or download it below.</p>
              <div className="mt-3 flex items-center gap-2">
                <Link
                  href={`/dashboard/appointments/${latestPrescriptionReadyNotification.appointmentId}/prescription/print`}
                  onClick={() => setShowToast(false)}
                  className="rounded bg-emerald-800 px-2 py-1.5 text-[10px] font-semibold text-white hover:bg-emerald-700 transition"
                >
                  View Prescription
                </Link>
                <a
                  href={`/api/prescription/${latestPrescriptionReadyNotification.appointmentId}/pdf`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setShowToast(false)}
                  className="rounded border border-slate-200 bg-slate-50 px-2 py-1.5 text-[10px] font-semibold text-slate-700 hover:bg-slate-100 transition"
                >
                  Download PDF
                </a>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowToast(false)}
              className="text-xs font-bold text-slate-400 hover:text-slate-600"
              aria-label="Dismiss toast"
            >
              ✕
            </button>
          </div>
        </div>
      )}
      <aside
        className={`h-screen sticky top-0 border-r border-slate-200 bg-white p-3 flex flex-col justify-between transition-all shrink-0 ${
          collapsed ? "w-14" : "w-14 md:w-60"
        } z-40`}
      >
        <div>
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3 mb-4">
            <div className={`transition-all duration-300 ${collapsed ? "md:opacity-0 md:w-0 overflow-hidden" : "hidden md:block"}`}>
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

        <form action={logoutPatient} className="mt-4 border-t border-slate-100 pt-3">
          <SubmitButton variant="ghost" pendingText="Leaving...">
            <span className={collapsed ? "hidden" : "hidden md:inline"}>Logout</span>
            <span className={collapsed ? "hidden" : "inline md:hidden"}>Exit</span>
          </SubmitButton>
        </form>
      </aside>

      <section
        className="flex-1 min-w-0 p-4 md:p-6 lg:p-8"
      >
        {children}
      </section>
    </main>
  );
}
