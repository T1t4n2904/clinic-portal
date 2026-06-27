"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";

type SubmitButtonProps = {
  children: ReactNode;
  pendingText?: string;
  fullWidth?: boolean;
  variant?: "primary" | "secondary" | "ghost";
};

export function SubmitButton({
  children,
  pendingText = "Please wait...",
  fullWidth = true,
  variant = "primary",
}: SubmitButtonProps) {
  const { pending } = useFormStatus();
  const variantClasses = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary:
      "border border-slate-300 bg-white text-slate-700 hover:bg-slate-100",
    ghost: "bg-transparent text-blue-600 hover:bg-blue-50",
  };

  return (
    <button
      type="submit"
      disabled={pending}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 ${variantClasses[variant]} ${
        fullWidth ? "w-full" : ""
      }`}
    >
      {pending ? (
        <>
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current/30 border-t-current" />
          {pendingText}
        </>
      ) : (
        children
      )}
    </button>
  );
}
