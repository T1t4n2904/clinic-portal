"use client";

import { useActionState, useState } from "react";
import { Field } from "@/components/Field";
import { SubmitButton } from "@/components/SubmitButton";
import { verifyLoginOtp } from "./actions";

type VerifyLoginOtpFormProps = {
  challenge?: string;
  devOtp?: string;
};

export function VerifyLoginOtpForm({
  challenge = "",
  devOtp,
}: VerifyLoginOtpFormProps) {
  const [state, formAction] = useActionState(verifyLoginOtp, {});
  const [otp, setOtp] = useState("");

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="challenge" value={challenge} />

      {devOtp ? (
        <p className="rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-700">
          Dev login OTP: <span className="font-semibold">{devOtp}</span>
        </p>
      ) : null}

      <Field
        label="Login OTP"
        name="otp"
        placeholder="6-digit OTP"
        value={otp}
        onChange={(event) => setOtp(event.target.value)}
        error={state.message}
      />

      <SubmitButton pendingText="Verifying OTP...">Verify and continue</SubmitButton>
    </form>
  );
}
