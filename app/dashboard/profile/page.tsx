import { requirePatient } from "@/lib/auth";
import { ProfileForm } from "./ProfileForm";

export default async function ProfilePage() {
  const user = await requirePatient();

  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-white p-8 shadow-sm">
        <p className="text-sm font-medium text-blue-600">Profile Settings</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">
          Manage your patient profile
        </h1>
        <p className="mt-3 text-sm text-slate-600">
          Update your basic account details. Your verified phone number is
          locked for now.
        </p>

        <div className="mt-8 max-w-xl">
          <ProfileForm user={user} />
        </div>
      </section>

      <section className="rounded-2xl border border-red-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold text-red-700">Danger Zone</p>
        <h2 className="mt-2 text-lg font-semibold">Delete account</h2>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          Account deletion will require typing DELETE and confirming with an
          OTP. This safety flow is not implemented yet.
        </p>
        <div className="mt-4 flex gap-3">
          <input
            disabled
            placeholder="Type DELETE"
            className="rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm"
          />
          <button
            type="button"
            disabled
            className="rounded-lg bg-slate-200 px-4 py-2 text-sm font-medium text-slate-500"
          >
            Delete account disabled
          </button>
        </div>
      </section>
    </div>
  );
}
