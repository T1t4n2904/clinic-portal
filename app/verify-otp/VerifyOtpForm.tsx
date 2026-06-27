"use client";

import { useActionState } from "react";
import { Field } from "@/components/Field";
import { SubmitButton } from "@/components/SubmitButton";
import { resendPhoneOtp, verifyPhoneOtp } from "./actions";

type VerifyOtpFormProps = {
  phone?: string;
  devOtp?: string;
};

export function VerifyOtpForm({ phone = "", devOtp }: VerifyOtpFormProps) {
  const [verifyState, verifyAction] = useActionState(verifyPhoneOtp, {});
  const [resendState, resendAction] = useActionState(resendPhoneOtp, {});
  const visibleDevOtp = resendState.devOtp || devOtp;

  return (
    <div className="space-y-6">
      {visibleDevOtp ? (
        <div className="rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-700">
          Dev OTP: <span className="font-semibold">{visibleDevOtp}</span>
        </div>
      ) : null}

      <form action={verifyAction} className="space-y-5">
        <Field
          label="Phone number"
          name="phone"
          placeholder="10-digit mobile number"
          defaultValue={phone}
        />

        <Field label="OTP" name="otp" placeholder="6-digit OTP" />

        {verifyState.message ? (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {verifyState.message}
          </p>
        ) : null}

        <SubmitButton>Verify OTP</SubmitButton>
      </form>

      <form action={resendAction} className="space-y-3 border-t border-white/20 pt-5">
        <input type="hidden" name="phone" value={phone} />

        {resendState.message ? (
          <p className="rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-700">
            {resendState.message}
          </p>
        ) : null}

        <button
          type="submit"
          className="text-sm font-medium text-blue-300 hover:text-blue-200"
        >
          Resend OTP
        </button>
      </form>
    </div>
  );
}
