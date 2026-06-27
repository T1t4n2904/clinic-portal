import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";
import { logoutPatient } from "./actions";

export default async function DashboardPage() {
  const userId = await getSessionUserId();

  if (!userId) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-900">
      <section className="mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-blue-600">Patient Dashboard</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">
              Welcome, {user.fullName}
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Your registered patient details are shown below.
            </p>
          </div>

          <form action={logoutPatient}>
            <button
              type="submit"
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Logout
            </button>
          </form>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <DetailCard label="Email" value={user.email} />
          <DetailCard label="Phone" value={user.phone} />
          <DetailCard label="Age" value={user.age?.toString() || "Not provided"} />
          <DetailCard label="Gender" value={user.gender || "Not provided"} />
        </div>
      </section>
    </main>
  );
}

function DetailCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium">{value}</p>
    </div>
  );
}
