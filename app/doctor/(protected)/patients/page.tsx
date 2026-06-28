import { redirect } from "next/navigation";

export default function DoctorPatientsRedirectPage() {
  redirect("/doctor/appointments");
}
