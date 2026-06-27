import { AuthShell } from "@/components/AuthShell";
import { LoginForm } from "./LoginForm";

type LoginPageProps = {
  searchParams: Promise<{ reset?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;

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
      <LoginForm />
    </AuthShell>
  );
}
