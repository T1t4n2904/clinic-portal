import { AuthShell } from "@/components/AuthShell";
import { RegisterForm } from "./RegisterForm";

export default function RegisterPage() {
  return (
    <AuthShell
      title="Create patient account"
      subtitle="Register with your basic details before phone verification."
    >
      <RegisterForm />
    </AuthShell>
  );
}