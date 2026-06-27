import { AuthShell } from "@/components/AuthShell";
import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <AuthShell
      title="Login to your account"
      subtitle="Access your patient dashboard after phone verification."
    >
      <LoginForm />
    </AuthShell>
  );
}