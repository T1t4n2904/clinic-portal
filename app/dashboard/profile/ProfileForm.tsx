"use client";

import { useActionState } from "react";
import { Field } from "@/components/Field";
import { SelectField } from "@/components/SelectField";
import { SubmitButton } from "@/components/SubmitButton";
import { updatePatientProfile } from "./actions";

type ProfileFormProps = {
  user: {
    fullName: string;
    age: number | null;
    gender: string | null;
    email: string;
    phone: string;
  };
};

export function ProfileForm({ user }: ProfileFormProps) {
  const [state, formAction] = useActionState(updatePatientProfile, {});

  return (
    <form action={formAction} className="space-y-5">
      <Field
        label="Full name"
        name="fullName"
        defaultValue={user.fullName}
        error={state.errors?.fullName}
      />

      <Field
        label="Age"
        name="age"
        type="number"
        defaultValue={user.age?.toString() || ""}
        error={state.errors?.age}
      />

      <SelectField
        label="Gender"
        name="gender"
        options={["Female", "Male", "Other"]}
        defaultValue={user.gender || ""}
        error={state.errors?.gender}
      />

      <Field
        label="Email"
        name="email"
        type="email"
        defaultValue={user.email}
        error={state.errors?.email}
      />

      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">
          Verified phone number
        </label>
        <input
          value={user.phone}
          disabled
          className="w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-600"
        />
        <p className="text-xs text-slate-500">
          Phone cannot be edited because it is your verified identity.
        </p>
      </div>

      {state.message ? (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {state.message}
        </p>
      ) : null}

      <SubmitButton>Save profile</SubmitButton>
    </form>
  );
}
