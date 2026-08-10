import { createHmac, createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "dinastiya_admin";
const SESSION_SECONDS = 60 * 60 * 12;

function secret() {
  const value = process.env.ADMIN_SESSION_SECRET;
  if (!value || value.length < 32) throw new Error("ADMIN_SESSION_SECRET must contain at least 32 characters");
  return value;
}

function sign(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function verifyAdminPassword(value: string) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || expected.length < 10) return false;
  const a = createHash("sha256").update(value).digest();
  const b = createHash("sha256").update(expected).digest();
  return timingSafeEqual(a, b);
}

export function createAdminToken() {
  const payload = `admin:${Math.floor(Date.now() / 1000) + SESSION_SECONDS}`;
  return `${Buffer.from(payload).toString("base64url")}.${sign(payload)}`;
}

function verifyToken(token?: string) {
  if (!token) return false;
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return false;
  try {
    const payload = Buffer.from(encoded, "base64url").toString("utf8");
    const [role, expires] = payload.split(":");
    const expected = sign(payload);
    if (signature.length !== expected.length || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return false;
    return role === "admin" && Number(expires) > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

export async function getAdminUser() {
  const store = await cookies();
  if (!verifyToken(store.get(ADMIN_COOKIE)?.value)) return null;
  return {
    displayName: process.env.ADMIN_NAME || "Администратор",
    email: process.env.ADMIN_EMAIL || "admin@dinastiya.local",
  };
}

export const adminCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_SECONDS,
};
