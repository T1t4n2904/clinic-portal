import { AuthShell } from "@/components/AuthShell";
import { LoginForm } from "./LoginForm";
import { getSessionUserId, clearSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

type LoginPageProps = {
  searchParams: Promise<{ reset?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const userId = await getSessionUserId();
  let showDoctorSessionClosed = false;

  if (userId) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user && user.role === "DOCTOR") {
      await clearSession();
      showDoctorSessionClosed = true;
    }
  }

  return (
    <AuthShell
      title="Login to your account"
      subtitle="Access your patient dashboard after phone verification."
    >
      {params.reset === "1" ? (
        <p className="mb-5 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          Password reset successful. Please login with your new password.
        </p>
      ) : null}
      {showDoctorSessionClosed ? (
        <p className="mb-5 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-805">
          Your active Doctor session was closed. Please log in with your Patient account.
        </p>
      ) : null}
      <LoginForm />
    </AuthShell>
  );
}
