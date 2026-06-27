"use client";

import { useActionState, useEffect, useState } from "react";
import { Field } from "@/components/Field";
import { SubmitButton } from "@/components/SubmitButton";
import { resetPassword } from "./actions";

type ResetPasswordFormProps = {
  identifier?: string;
};

export function ResetPasswordForm({ identifier = "" }: ResetPasswordFormProps) {
  const [state, formAction] = useActionState(resetPassword, {});
  const [values, setValues] = useState({
    identifier,
    otp: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setErrors(state.errors || {});
  }, [state.errors]);

  function updateValue(name: keyof typeof values, value: string) {
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
  }

  return (
    <form action={formAction} className="space-y-5">
      <Field
        label="Email or phone number"
        name="identifier"
        placeholder="you@example.com or 10-digit phone"
        value={values.identifier}
        onChange={(event) => updateValue("identifier", event.target.value)}
        error={errors.identifier}
      />

      <Field
        label="Reset OTP"
        name="otp"
        placeholder="6-digit OTP"
        value={values.otp}
        onChange={(event) => updateValue("otp", event.target.value)}
        error={errors.otp}
      />

      <Field
        label="New password"
        name="password"
        type="password"
        placeholder="Minimum 8 characters"
        value={values.password}
        onChange={(event) => updateValue("password", event.target.value)}
        error={errors.password}
      />

      <Field
        label="Confirm new password"
        name="confirmPassword"
        type="password"
        placeholder="Re-enter new password"
        value={values.confirmPassword}
        onChange={(event) => updateValue("confirmPassword", event.target.value)}
        error={errors.confirmPassword}
      />

      <SubmitButton>Reset password</SubmitButton>
    </form>
  );
}
