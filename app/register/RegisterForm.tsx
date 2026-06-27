"use client";

import { useActionState, useEffect, useState } from "react";
import { Field } from "@/components/Field";
import { SelectField } from "@/components/SelectField";
import { SubmitButton } from "@/components/SubmitButton";
import { registerPatient } from "./actions";

type RegisterValues = {
  fullName: string;
  age: string;
  gender: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
};

const initialValues: RegisterValues = {
  fullName: "",
  age: "",
  gender: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
};

export function RegisterForm() {
  const [state, formAction] = useActionState(registerPatient, {});
  const [values, setValues] = useState(initialValues);
  const [visibleErrors, setVisibleErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setVisibleErrors(state.errors || {});
  }, [state.errors]);

  function updateValue(name: keyof RegisterValues, value: string) {
    setValues((current) => ({
      ...current,
      [name]: value,
    }));

    setVisibleErrors((current) => {
      if (!current[name]) {
        return current;
      }

      const next = { ...current };
      delete next[name];
      return next;
    });
  }

  return (
    <form action={formAction} className="space-y-5">
      <Field
        label="Full name"
        name="fullName"
        placeholder="Enter full name"
        value={values.fullName}
        onChange={(event) => updateValue("fullName", event.target.value)}
        error={visibleErrors.fullName}
      />

      <Field
        label="Age"
        name="age"
        type="number"
        placeholder="Enter age"
        value={values.age}
        onChange={(event) => updateValue("age", event.target.value)}
        error={visibleErrors.age}
      />

      <SelectField
        label="Gender"
        name="gender"
        options={["Female", "Male", "Other"]}
        value={values.gender}
        onChange={(event) => updateValue("gender", event.target.value)}
        error={visibleErrors.gender}
      />

      <Field
        label="Email"
        name="email"
        type="email"
        placeholder="you@example.com"
        value={values.email}
        onChange={(event) => updateValue("email", event.target.value)}
        error={visibleErrors.email}
      />

      <Field
        label="Phone number"
        name="phone"
        placeholder="10-digit mobile number"
        value={values.phone}
        onChange={(event) => updateValue("phone", event.target.value)}
        error={visibleErrors.phone}
      />

      <Field
        label="Password"
        name="password"
        type="password"
        placeholder="Minimum 8 characters"
        value={values.password}
        onChange={(event) => updateValue("password", event.target.value)}
        error={visibleErrors.password}
      />

      <Field
        label="Confirm password"
        name="confirmPassword"
        type="password"
        placeholder="Re-enter password"
        value={values.confirmPassword}
        onChange={(event) => updateValue("confirmPassword", event.target.value)}
        error={visibleErrors.confirmPassword}
      />

      <SubmitButton>Create account</SubmitButton>
    </form>
  );
}
