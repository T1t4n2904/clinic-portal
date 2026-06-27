"use client";

import { useActionState } from "react";
import { Field } from "@/components/Field";
import { SelectField } from "@/components/SelectField";
import { SubmitButton } from "@/components/SubmitButton";
import { registerPatient } from "./actions";

export function RegisterForm() {
  const [state, formAction] = useActionState(registerPatient, {});

  return (
    <form action={formAction} className="space-y-5">
      <Field
        label="Full name"
        name="fullName"
        placeholder="Enter full name"
        error={state.errors?.fullName}
      />

      <Field
        label="Age"
        name="age"
        type="number"
        placeholder="Enter age"
        error={state.errors?.age}
      />

      <SelectField
        label="Gender"
        name="gender"
        options={["Female", "Male", "Other"]}
        error={state.errors?.gender}
      />

      <Field
        label="Email"
        name="email"
        type="email"
        placeholder="you@example.com"
        error={state.errors?.email}
      />

      <Field
        label="Phone number"
        name="phone"
        placeholder="10-digit mobile number"
        error={state.errors?.phone}
      />

      <Field
        label="Password"
        name="password"
        type="password"
        placeholder="Minimum 8 characters"
        error={state.errors?.password}
      />

      <Field
        label="Confirm password"
        name="confirmPassword"
        type="password"
        placeholder="Re-enter password"
        error={state.errors?.confirmPassword}
      />

      <SubmitButton>Create account</SubmitButton>
    </form>
  );
}
