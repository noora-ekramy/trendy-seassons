import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export const ADMIN_COOKIE = "admin_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function getSessionSecret(): string {
  const password = process.env.ADMIN_PASSWORD ?? "";
  const secret = process.env.ADMIN_SECRET ?? password;
  return `${secret}:${password}`;
}

function encodeBase64Url(value: string): string {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** Session token stored in httpOnly cookie after successful login */
export function createAdminSessionValue(): string {
  const payload = getSessionSecret();
  if (!payload || payload === ":") return "";
  return encodeBase64Url(payload);
}

export function verifyAdminSessionValue(value: string | undefined): boolean {
  if (!value) return false;
  const expected = createAdminSessionValue();
  if (!expected) return false;
  return value === expected;
}

export function verifyAdminRequest(request: NextRequest): boolean {
  return verifyAdminSessionValue(request.cookies.get(ADMIN_COOKIE)?.value);
}

export function unauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export function adminCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_MAX_AGE,
  };
}

export function verifyAdminPassword(password: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  return password === expected;
}
