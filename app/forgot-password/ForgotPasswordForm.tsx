"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { Field } from "@/components/Field";
import { SubmitButton } from "@/components/SubmitButton";
import { requestPasswordReset } from "./actions";

export function ForgotPasswordForm() {
  const [state, formAction] = useActionState(requestPasswordReset, {});
  const [identifier, setIdentifier] = useState("");

  useEffect(() => {
    if (state.identifier) {
      setIdentifier(state.identifier);
    }
  }, [state.identifier]);

  return (
    <div className="space-y-5">
      <form action={formAction} className="space-y-5">
        <Field
          label="Email or phone number"
          name="identifier"
          placeholder="you@example.com or 10-digit phone"
          value={identifier}
          onChange={(event) => setIdentifier(event.target.value)}
        />

        {state.message ? (
          <p className="rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-700">
            {state.message}
          </p>
        ) : null}

        {state.devOtp ? (
          <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            Dev OTP: <span className="font-semibold">{state.devOtp}</span>
          </p>
        ) : null}

        <SubmitButton>Generate reset OTP</SubmitButton>
      </form>

      <Link
        href={`/reset-password${identifier ? `?identifier=${encodeURIComponent(identifier)}` : ""}`}
        className="inline-flex text-xs font-semibold text-emerald-800 hover:text-emerald-700 transition"
      >
        Continue to reset password
      </Link>
    </div>
  );
}
