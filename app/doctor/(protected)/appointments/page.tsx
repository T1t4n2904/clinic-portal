import { redirect } from "next/navigation";

export default function DoctorAppointmentsRedirectPage() {
  redirect("/doctor/dashboard");
}
