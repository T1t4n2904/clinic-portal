import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const SESSION_COOKIE = "clinic_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export function getAppVersion() {
  return process.env.APP_VERSION || "dev";
}

function getSessionSecret() {
  return process.env.SESSION_SECRET || "clinic-portal-dev-session-secret";
}

function sign(value: string) {
  return createHmac("sha256", getSessionSecret()).update(value).digest("base64url");
}

function verifySignature(value: string, signature: string) {
  const expected = sign(value);
  const expectedBuffer = Buffer.from(expected);
  const actualBuffer = Buffer.from(signature);

  return (
    expectedBuffer.length === actualBuffer.length &&
    timingSafeEqual(expectedBuffer, actualBuffer)
  );
}

export async function createSession(userId: string) {
  const value = `${userId}:${getAppVersion()}`;
  const signature = sign(value);
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE, `${value}.${signature}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_MAX_AGE_SECONDS,
    path: "/",
  });
}

export async function getSessionUserId() {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE)?.value;

  if (!session) {
    return null;
  }

  const separatorIndex = session.lastIndexOf(".");

  if (separatorIndex === -1) {
    return null;
  }

  const value = session.slice(0, separatorIndex);
  const signature = session.slice(separatorIndex + 1);

  if (!value || !signature || !verifySignature(value, signature)) {
    return null;
  }

  const [userId, version] = value.split(":");

  if (!userId || version !== getAppVersion()) {
    return null;
  }

  return userId;
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
