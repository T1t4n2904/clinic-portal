import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

type PatientDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function PatientDetailPage({
  params,
}: PatientDetailPageProps) {
  const { id } = await params;
  const patient = await prisma.user.findFirst({
    where: {
      id,
      role: "PATIENT",
      appointments: {
        some: {},
      },
    },
    select: {
      fullName: true,
      email: true,
      phone: true,
      age: true,
      gender: true,
      phoneVerified: true,
      createdAt: true,
      appointments: {
        select: {
          id: true,
          slotLabel: true,
          status: true,
          paymentStatus: true,
        },
        orderBy: { slotStart: "desc" },
      },
    },
  });

  if (!patient) {
    notFound();
  }

  return (
    <section className="rounded-2xl bg-white p-8 text-slate-900 shadow-sm">
      <Link
        href="/doctor/patients"
        className="text-sm font-medium text-blue-600 hover:text-blue-700"
      >
        Back to patients
      </Link>

      <div className="mt-6">
        <p className="text-sm font-medium text-blue-600">Patient Profile</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">
          {patient.fullName}
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Appointment-linked profile only. Medical records are not implemented yet.
        </p>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Detail label="Email" value={patient.email} />
        <Detail label="Phone" value={patient.phone} />
        <Detail label="Age" value={patient.age?.toString() || "Not provided"} />
        <Detail label="Gender" value={patient.gender || "Not provided"} />
        <Detail
          label="Verified"
          value={patient.phoneVerified ? "Yes" : "No"}
        />
        <Detail
          label="Registered"
          value={patient.createdAt.toLocaleString()}
        />
        <Detail
          label="Appointments"
          value={patient.appointments.length.toString()}
        />
      </div>
    </section>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium">{value}</p>
    </div>
  );
}
