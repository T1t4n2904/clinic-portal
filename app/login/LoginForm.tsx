"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { Field } from "@/components/Field";
import { SubmitButton } from "@/components/SubmitButton";
import { loginPatient } from "./actions";

export function LoginForm() {
  const [state, formAction] = useActionState(loginPatient, {});
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [visibleErrors, setVisibleErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setVisibleErrors(state.errors || {});
  }, [state.errors]);

  return (
    <form action={formAction} className="space-y-5">
      <Field
        label="Email or phone number"
        name="identifier"
        placeholder="you@example.com or 10-digit phone"
        value={identifier}
        onChange={(event) => {
          setIdentifier(event.target.value);
          setVisibleErrors((current) => ({ ...current, identifier: "" }));
        }}
        error={visibleErrors.identifier}
      />

      <Field
        label="Password"
        name="password"
        type="password"
        placeholder="Enter password"
        value={password}
        onChange={(event) => {
          setPassword(event.target.value);
          setVisibleErrors((current) => ({ ...current, password: "" }));
        }}
        error={visibleErrors.password}
      />

      {state.message ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.message}
        </p>
      ) : null}

      <SubmitButton>Login</SubmitButton>

      <Link
        href="/forgot-password"
        className="inline-flex text-sm font-medium text-blue-600 hover:text-blue-700"
      >
        Forgot password?
      </Link>
    </form>
  );
}
