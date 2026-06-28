import { redirect } from "next/navigation";

export default function DoctorPatientDetailRedirectPage() {
  redirect("/doctor/appointments");
}
