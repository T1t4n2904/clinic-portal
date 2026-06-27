type RegisterInput = {
  fullName: string;
  age: string;
  gender: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
};

type ValidRegisterResult = {
  isValid: true;
  data: {
    fullName: string;
    age: number | null;
    gender: string | null;
    email: string;
    phone: string;
    password: string;
  };
  errors: Record<string, never>;
};

type InvalidRegisterResult = {
  isValid: false;
  data: null;
  errors: Record<string, string>;
};

export function validateRegisterInput(
  input: RegisterInput
): ValidRegisterResult | InvalidRegisterResult {
  const errors: Record<string, string> = {};
  const fullName = input.fullName.trim();
  const email = input.email.trim().toLowerCase();
  const phone = input.phone.trim();
  const gender = input.gender.trim();
  const ageValue = input.age.trim() ? Number(input.age) : null;

  if (!fullName) {
    errors.fullName = "Full name is required.";
  }

  if (ageValue !== null && (!Number.isInteger(ageValue) || ageValue <= 0)) {
    errors.age = "Age must be a positive number.";
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Enter a valid email address.";
  }

  if (!/^\d{10}$/.test(phone)) {
    errors.phone = "Enter a valid 10-digit phone number.";
  }

  if (input.password.length < 8) {
    errors.password = "Password must be at least 8 characters.";
  }

  if (input.password !== input.confirmPassword) {
    errors.confirmPassword = "Passwords do not match.";
  }

  if (Object.keys(errors).length > 0) {
    return { isValid: false, data: null, errors };
  }

  return {
    isValid: true,
    data: {
      fullName,
      age: ageValue,
      gender: gender || null,
      email,
      phone,
      password: input.password,
    },
    errors: {},
  };
}
