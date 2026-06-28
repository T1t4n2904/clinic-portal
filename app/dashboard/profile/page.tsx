import { requirePatient } from "@/lib/auth";
import { ProfileForm } from "./ProfileForm";

export default async function ProfilePage() {
  const user = await requirePatient();

  return (
    <div className="space-y-4">
      <section className="rounded-lg border border-slate-200 bg-white p-5 text-slate-900 shadow-sm md:p-6">
        <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">Profile Settings</p>
        <h1 className="mt-1 text-lg font-bold tracking-tight text-slate-900">
          Manage your patient profile
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          Update your basic account details. Your verified phone number is locked for now.
        </p>

        <div className="mt-6 max-w-xl">
          <ProfileForm user={user} />
        </div>
      </section>

      <section className="rounded-lg border border-red-200 bg-white p-5 shadow-sm md:p-6">
        <p className="text-[10px] font-bold uppercase tracking-wider text-red-700">Danger Zone</p>
        <h2 className="mt-1 text-sm font-semibold text-slate-900">Delete account</h2>
        <p className="mt-1 text-xs text-slate-500">
          Account deletion will require typing DELETE and confirming with an OTP. This safety flow is not implemented yet.
        </p>
        <div className="mt-4 flex gap-2">
          <input
            disabled
            placeholder="Type DELETE"
            className="rounded-lg border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs w-36 outline-none"
          />
          <button
            type="button"
            disabled
            className="rounded-lg bg-slate-100 border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-400 cursor-not-allowed"
          >
            Delete account disabled
          </button>
        </div>
      </section>
    </div>
  );
}

