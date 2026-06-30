import { AuthShell } from "@/components/AuthShell";
import { DoctorLoginForm } from "./DoctorLoginForm";
import { getSessionUserId, clearSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export default async function DoctorLoginPage() {
  const userId = await getSessionUserId();
  let showPatientSessionClosed = false;

  if (userId) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user && user.role === "PATIENT") {
      await clearSession();
      showPatientSessionClosed = true;
    }
  }

  return (
    <AuthShell
      title="Doctor login"
      subtitle="Restricted clinic access for staff accounts only."
    >
      {showPatientSessionClosed ? (
        <p className="mb-5 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-805">
          Your active Patient session was closed. Please log in with your Doctor account.
        </p>
      ) : null}
      <DoctorLoginForm />
    </AuthShell>
  );
}
