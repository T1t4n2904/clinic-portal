import Link from "next/link";
import { notFound } from "next/navigation";
import { SubmitButton } from "@/components/SubmitButton";
import { ConsultationView } from "@/components/ConsultationView";
import { PrescriptionView } from "@/components/PrescriptionView";
import { prisma } from "@/lib/prisma";
import { requirePatient } from "@/lib/auth";
import { cancelPatientAppointment, demoPayAppointment } from "../actions";
import { RazorpayButton } from "@/components/RazorpayButton";

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
          prescription: {
            include: {
              medicines: {
                orderBy: { sortOrder: "asc" },
              },
            },
          },
        },
      },
      payments: {
        select: {
          id: true,
          provider: true,
          status: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      },
      notificationLogs: {
        select: {
          id: true,
          channel: true,
          type: true,
          status: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!appointment) {
    notFound();
  }

  const canPay = appointment.paymentStatus === "PENDING";
  const canCancel =
    appointment.status !== "COMPLETED" && appointment.status !== "CANCELLED";

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  const isRazorpayConfigured = !!(keyId && keySecret);
  const isTestMode = !!keyId?.startsWith("rzp_test_");

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 text-slate-900 shadow-sm md:p-6">
      <Link
        href="/dashboard/appointments"
        className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
      >
        ← Back
      </Link>

      {query.paid === "1" ? (
        <p className="mt-4 rounded-lg bg-emerald-50 px-4 py-2.5 text-xs text-emerald-800 border border-emerald-100 font-semibold">
          Payment successful. Your appointment has been confirmed.
        </p>
      ) : null}

      {query.cancelled === "1" ? (
        <p className="mt-4 rounded-lg bg-amber-50 px-4 py-2.5 text-xs text-amber-800 border border-amber-100">
          Appointment cancelled.
        </p>
      ) : null}

      <div className="mt-4 border-b border-slate-100 pb-4">
        <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">Appointment Detail</p>
        <h1 className="mt-1 text-lg font-bold tracking-tight">
          {appointment.slotLabel}
        </h1>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Detail label="Mode" value={appointment.mode} />
        <Detail label="Slot" value={appointment.slotStart.toLocaleString()} />
        <Detail label="Amount" value={`Rs. ${appointment.amount}`} />
        <Detail label="Payment" value={appointment.paymentStatus} />
        <Detail label="Status" value={getPatientFriendlyStatus(appointment.status, !!appointment.consultation?.prescription)} />
      </div>

      <div className="mt-8 flex flex-wrap items-end gap-3">
        {canPay && canCancel ? (
          <>
            {process.env.NODE_ENV === "development" && (
              <form action={demoPayAppointment}>
                <input type="hidden" name="appointmentId" value={appointment.id} />
                <SubmitButton pendingText="Processing demo payment..." fullWidth={false}>
                  Demo Pay Rs. {appointment.amount}
                </SubmitButton>
              </form>
            )}
            
            <RazorpayButton
              appointmentId={appointment.id}
              amount={appointment.amount}
              disabled={!isRazorpayConfigured}
              setupMessage={
                !isRazorpayConfigured
                  ? (process.env.NODE_ENV === "development"
                      ? "Online payment credentials missing. Please use Demo Pay in development."
                      : "Online payment is currently unavailable.")
                  : undefined
              }
              isTestMode={isTestMode}
            />
          </>
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

      {/* Payment Records History */}
      {appointment.payments.length > 0 ? (
        <div className="mt-6 border-t border-slate-100 pt-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Payment History</h3>
          <div className="space-y-1.5">
            {appointment.payments.map((p) => (
              <div key={p.id} className="flex justify-between items-center text-xs text-slate-600 bg-slate-50 rounded border border-slate-100 px-3 py-1.5">
                <span>{p.provider} Payment</span>
                <span className="font-semibold text-slate-900">{p.status}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Notification Logs History */}
      {appointment.notificationLogs.length > 0 ? (
        <div className="mt-6 border-t border-slate-100 pt-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Notification Logs</h3>
          <div className="space-y-1.5">
            {appointment.notificationLogs.map((log) => {
              let displayStatus: string = log.status;
              if (log.status === "FAILED") {
                displayStatus = "Failed";
              } else if (log.status === "PENDING") {
                displayStatus = "Pending";
              } else if (log.status === "SENT") {
                displayStatus = log.channel === "WHATSAPP" ? "WhatsApp sent" : (log.channel === "DEMO" ? "Demo sent" : `${log.channel} sent`);
              }

              return (
                <div key={log.id} className="flex justify-between items-center text-xs text-slate-600 bg-slate-50 rounded border border-slate-100 px-3 py-1.5">
                  <div>
                    <span className="font-semibold text-slate-900">{log.type.replace(/_/g, " ")}</span>
                  </div>
                  <span className={`font-semibold ${log.status === "SENT" ? "text-emerald-700" : (log.status === "FAILED" ? "text-red-600" : "text-slate-500")}`}>
                    {displayStatus}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      {appointment.status === "COMPLETED" && !appointment.consultation?.prescription ? (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800 text-center">
          Consultation completed. Please wait while the doctor prepares your prescription.
        </div>
      ) : null}

      {appointment.consultation ? (
        <>
          <ConsultationView consultation={appointment.consultation} />
          {appointment.consultation.prescription ? (
            <div className="space-y-4">
              {appointment.notificationLogs.some((l) => l.type === "PRESCRIPTION_READY") && (
                <div className="mt-4 rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 font-semibold">
                  ✓ Prescription issued and sent to your registered phone number.
                </div>
              )}
              <PrescriptionView prescription={appointment.consultation.prescription} />
            </div>
          ) : null}
        </>
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

function getPatientFriendlyStatus(status: string, hasPrescription: boolean) {
  switch (status) {
    case "PAYMENT_PENDING":
      return "Payment pending";
    case "CONFIRMED":
      return "Appointment confirmed";
    case "CHECKED_IN":
      return "Checked in / Waiting for doctor";
    case "IN_CONSULTATION":
      return "Consultation in progress";
    case "COMPLETED":
      return hasPrescription ? "Prescription ready" : "Doctor preparing prescription";
    case "CANCELLED":
      return "Cancelled";
    default:
      return status.replace("_", " ");
  }
}
