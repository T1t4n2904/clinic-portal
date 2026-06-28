"use client";

import type { ChangeEventHandler } from "react";

type SelectFieldProps = {
  label: string;
  name: string;
  options: string[];
  defaultValue?: string;
  value?: string;
  onChange?: ChangeEventHandler<HTMLSelectElement>;
  error?: string;
};

export function SelectField({
  label,
  name,
  options,
  defaultValue = "",
  value,
  onChange,
  error,
}: SelectFieldProps) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={name}
        className="block text-sm font-medium text-slate-700"
      >
        {label}
      </label>

      <select
        id={name}
        name={name}
        className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-emerald-800 ${
          error ? "border-red-300" : "border-slate-300"
        }`}
        defaultValue={value === undefined ? defaultValue : undefined}
        value={value}
        onChange={onChange}
      >
        <option value="" disabled>
          Select {label.toLowerCase()}
        </option>

        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
