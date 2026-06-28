import Link from "next/link";
import { notFound } from "next/navigation";
import { SubmitButton } from "@/components/SubmitButton";
import { ConsultationView } from "@/components/ConsultationView";
import { prisma } from "@/lib/prisma";
import { requirePatient } from "@/lib/auth";
import { cancelPatientAppointment, demoPayAppointment } from "../actions";

type AppointmentDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ cancelled?: string; paid?: string }>;
};

export default async function PatientAppointmentDetailPage({
  params,
  searchParams,
}: AppointmentDetailPageProps) {
  const patient = await requirePatient();
  const { id } = await params;
  const query = await searchParams;
  const appointment = await prisma.appointment.findFirst({
    where: {
      id,
      patientId: patient.id,
    },
    select: {
      id: true,
      mode: true,
      slotStart: true,
      slotLabel: true,
      amount: true,
      paymentStatus: true,
      status: true,
      consultation: {
        select: {
          chiefComplaint: true,
          symptoms: true,
          diagnosis: true,
          advice: true,
          followUpDate: true,
          createdAt: true,
        },
      },
    },
  });

  if (!appointment) {
    notFound();
  }

  const canPay = appointment.paymentStatus === "PENDING";
  const canCancel =
    appointment.status !== "COMPLETED" && appointment.status !== "CANCELLED";

  return (
    <section className="rounded-2xl bg-white p-8 shadow-sm">
      <Link
        href="/dashboard/appointments"
        className="text-sm font-medium text-blue-600 hover:text-blue-700"
      >
        Back to appointments
      </Link>

      {query.paid === "1" ? (
        <p className="mt-6 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Demo payment successful. Your appointment is confirmed.
        </p>
      ) : null}

      {query.cancelled === "1" ? (
        <p className="mt-6 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Appointment cancelled.
        </p>
      ) : null}

      <div className="mt-6">
        <p className="text-sm font-medium text-blue-600">Appointment Detail</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">
          {appointment.slotLabel}
        </h1>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Detail label="Mode" value={appointment.mode} />
        <Detail label="Slot" value={appointment.slotStart.toLocaleString()} />
        <Detail label="Amount" value={`Rs. ${appointment.amount}`} />
        <Detail label="Payment" value={appointment.paymentStatus} />
        <Detail label="Status" value={appointment.status.replace("_", " ")} />
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        {canPay && canCancel ? (
          <form action={demoPayAppointment}>
            <input type="hidden" name="appointmentId" value={appointment.id} />
            <SubmitButton pendingText="Processing demo payment..." fullWidth={false}>
              Demo Pay Rs. {appointment.amount}
            </SubmitButton>
          </form>
        ) : null}

        {canCancel ? (
          <form action={cancelPatientAppointment}>
            <input type="hidden" name="appointmentId" value={appointment.id} />
            <SubmitButton
              pendingText="Cancelling..."
              fullWidth={false}
              variant="secondary"
            >
              Cancel appointment
            </SubmitButton>
          </form>
        ) : null}

        <button
          type="button"
          disabled
          className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-400"
        >
          Reschedule coming soon
        </button>
      </div>

      {!canPay ? (
        <p className="mt-5 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
          Payment is complete. This demo appointment is confirmed unless the
          appointment status changes.
        </p>
      ) : null}

      {appointment.consultation ? (
        <ConsultationView consultation={appointment.consultation} />
      ) : null}
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
