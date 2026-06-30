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

        <div className="mt-5 mb-6 rounded-lg border border-slate-200 bg-slate-50 p-4 max-w-xl text-xs space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200 pb-1 mb-2">Profile Snapshot</p>
          <div className="grid grid-cols-2 gap-y-1.5 leading-normal text-slate-700">
            <div><span className="font-semibold text-slate-500 font-mono">Name:</span> {user.fullName}</div>
            <div><span className="font-semibold text-slate-500 font-mono">Phone:</span> {user.phone}</div>
            <div><span className="font-semibold text-slate-500 font-mono">Age:</span> {user.age || "Pending"}</div>
            <div><span className="font-semibold text-slate-500 font-mono">Gender:</span> {user.gender || "Pending"}</div>
            <div className="col-span-2"><span className="font-semibold text-slate-500 font-mono">Email:</span> {user.email}</div>
          </div>
        </div>

        <div className="max-w-xl">
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

