import * as bcrypt from "bcrypt";

export function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function getOtpExpiry(minutes: number) {
  return new Date(Date.now() + minutes * 60 * 1000);
}

export function hashOtp(otp: string) {
  return bcrypt.hash(otp, 10);
}

export function verifyOtp(otp: string, otpHash: string) {
  return bcrypt.compare(otp, otpHash);
}

export function isOtpExpired(expiresAt: Date) {
  return expiresAt.getTime() <= Date.now();
}
