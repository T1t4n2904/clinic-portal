import { AuthShell } from "@/components/AuthShell";
import { ForgotPasswordForm } from "./ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Reset your password"
      subtitle="Generate a demo OTP for your patient account."
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
