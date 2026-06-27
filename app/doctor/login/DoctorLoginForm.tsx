"use client";

import { useActionState } from "react";
import { Field } from "@/components/Field";
import { SubmitButton } from "@/components/SubmitButton";
import { loginDoctor } from "./actions";

export function DoctorLoginForm() {
  const [state, formAction] = useActionState(loginDoctor, {});

  return (
    <form action={formAction} className="space-y-5">
      <Field
        label="Doctor email or phone"
        name="identifier"
        placeholder="doctor@example.com or 10-digit phone"
      />

      <Field
        label="Password"
        name="password"
        type="password"
        placeholder="Enter password"
      />

      {state.message ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.message}
        </p>
      ) : null}

      <SubmitButton>Login as doctor</SubmitButton>
    </form>
  );
}
