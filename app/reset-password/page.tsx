import { AuthShell } from "@/components/AuthShell";
import { ResetPasswordForm } from "./ResetPasswordForm";

type ResetPasswordPageProps = {
  searchParams: Promise<{ identifier?: string }>;
};

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const params = await searchParams;

  return (
    <AuthShell
      title="Set a new password"
      subtitle="Use your reset OTP and choose a new password."
    >
      <ResetPasswordForm identifier={params.identifier} />
    </AuthShell>
  );
}
