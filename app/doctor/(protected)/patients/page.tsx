import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function DoctorPatientsPage() {
  const patients = await prisma.user.findMany({
    where: { role: "PATIENT" },
    orderBy: { createdAt: "desc" },
  });

  return (
    <section className="rounded-2xl bg-white p-8 text-slate-900 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-blue-600">Patients</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">
            Registered patients
          </h1>
        </div>
        <Link
          href="/doctor/dashboard"
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
        >
          Back to dashboard
        </Link>
      </div>

      {patients.length === 0 ? (
        <p className="mt-8 rounded-xl border border-dashed border-slate-300 p-6 text-sm text-slate-600">
          No patients have registered yet.
        </p>
      ) : (
        <div className="mt-8 overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                <th className="py-3 pr-4">Name</th>
                <th className="py-3 pr-4">Age</th>
                <th className="py-3 pr-4">Gender</th>
                <th className="py-3 pr-4">Phone</th>
                <th className="py-3 pr-4">Email</th>
                <th className="py-3 pr-4">Verified</th>
                <th className="py-3 pr-4">Created</th>
                <th className="py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((patient) => (
                <tr key={patient.id} className="border-b border-slate-100">
                  <td className="py-3 pr-4 font-medium">{patient.fullName}</td>
                  <td className="py-3 pr-4">{patient.age ?? "Not provided"}</td>
                  <td className="py-3 pr-4">{patient.gender ?? "Not provided"}</td>
                  <td className="py-3 pr-4">{patient.phone}</td>
                  <td className="py-3 pr-4">{patient.email}</td>
                  <td className="py-3 pr-4">
                    {patient.phoneVerified ? "Yes" : "No"}
                  </td>
                  <td className="py-3 pr-4">
                    {patient.createdAt.toLocaleDateString()}
                  </td>
                  <td className="py-3">
                    <Link
                      href={`/doctor/patients/${patient.id}`}
                      className="font-medium text-blue-600 hover:text-blue-700"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
