import { AuthShell } from "@/components/AuthShell";
import { VerifyOtpForm } from "./VerifyOtpForm";

type VerifyOtpPageProps = {
  searchParams: Promise<{
    phone?: string;
    devOtp?: string;
  }>;
};

export default async function VerifyOtpPage({ searchParams }: VerifyOtpPageProps) {
  const params = await searchParams;

  return (
    <AuthShell
      title="Verify phone number"
      subtitle="Enter the OTP generated after registration."
    >
      <VerifyOtpForm phone={params.phone} devOtp={params.devOtp} />
    </AuthShell>
  );
}
