import { AuthShell } from "@/components/AuthShell";
import { DoctorLoginForm } from "./DoctorLoginForm";

export default function DoctorLoginPage() {
  return (
    <AuthShell
      title="Doctor login"
      subtitle="Restricted clinic access for staff accounts only."
    >
      <DoctorLoginForm />
    </AuthShell>
  );
}
