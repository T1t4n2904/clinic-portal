"use client";

import { useActionState } from "react";
import { Field } from "@/components/Field";
import { SubmitButton } from "@/components/SubmitButton";
import { loginPatient } from "./actions";

export function LoginForm() {
  const [state, formAction] = useActionState(loginPatient, {});

  return (
    <form action={formAction} className="space-y-5">
      <Field
        label="Email or phone number"
        name="identifier"
        placeholder="you@example.com or 10-digit phone"
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

      <SubmitButton>Login</SubmitButton>
    </form>
  );
}
