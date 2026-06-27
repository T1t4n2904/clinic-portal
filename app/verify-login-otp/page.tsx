import { AuthShell } from "@/components/AuthShell";
import { VerifyLoginOtpForm } from "./VerifyLoginOtpForm";

type VerifyLoginOtpPageProps = {
  searchParams: Promise<{
    challenge?: string;
    devOtp?: string;
  }>;
};

export default async function VerifyLoginOtpPage({
  searchParams,
}: VerifyLoginOtpPageProps) {
  const params = await searchParams;

  return (
    <AuthShell
      title="Verify login"
      subtitle="Enter the demo OTP generated after your password check."
    >
      <VerifyLoginOtpForm challenge={params.challenge} devOtp={params.devOtp} />
    </AuthShell>
  );
}
