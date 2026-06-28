import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireDoctor } from "@/lib/auth";

export default async function DoctorPatientsPage() {
  await requireDoctor();

  const patients = await prisma.user.findMany({
    where: { role: "PATIENT" },
    select: {
      id: true,
      fullName: true,
      age: true,
      gender: true,
      phone: true,
      email: true,
      createdAt: true,
      _count: {
        select: { appointments: true }
      }
    },
    orderBy: { fullName: "asc" }
  });

  return (
    <div className="space-y-4">
      <div className="border-b border-slate-200 pb-3 flex justify-between items-end">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-800">Directory</p>
          <h1 className="mt-1 text-xl font-bold text-slate-900 tracking-tight">Patients</h1>
        </div>
        <span className="text-[11px] font-medium px-2 py-0.5 bg-slate-100 rounded-full text-slate-600">
          {patients.length} registered
        </span>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white overflow-hidden shadow-sm">
        {patients.length === 0 ? (
          <p className="p-4 text-xs text-slate-500">No patient records found.</p>
        ) : (
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-2.5 px-4 font-semibold">Name</th>
                <th className="py-2.5 px-4 font-semibold">Age / Gender</th>
                <th className="py-2.5 px-4 font-semibold">Phone</th>
                <th className="py-2.5 px-4 font-semibold">Email</th>
                <th className="py-2.5 px-4 font-semibold text-center">Visits</th>
                <th className="py-2.5 px-4 font-semibold">Registered</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {patients.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2 px-4">
                    <span className="font-semibold text-slate-900">{p.fullName}</span>
                  </td>
                  <td className="py-2 px-4 text-slate-600">
                    {[p.age ? `${p.age} yrs` : null, p.gender].filter(Boolean).join(" / ") || "—"}
                  </td>
                  <td className="py-2 px-4 text-slate-600 font-mono">{p.phone}</td>
                  <td className="py-2 px-4 text-slate-600">{p.email}</td>
                  <td className="py-2 px-4 text-center text-slate-600 font-medium">
                    {p._count.appointments}
                  </td>
                  <td className="py-2 px-4 text-slate-500">
                    {p.createdAt.toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric"
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

