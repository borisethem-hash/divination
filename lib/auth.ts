import crypto from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { readDb, updateDb } from "./db";
import type { Role, User, Teller } from "./types";

const COOKIE = "tsuki_session";
const MAX_AGE = 60 * 60 * 24 * 14;

export async function createSession(userId: string): Promise<void> {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + MAX_AGE * 1000).toISOString();
  await updateDb((db) => {
    const now = new Date().toISOString();
    db.sessions = db.sessions.filter((s) => s.expiresAt > now);
    db.sessions.push({ token, userId, expiresAt });
  });
  const jar = await cookies();
  jar.set(COOKIE, token, { httpOnly: true, sameSite: "lax", path: "/", maxAge: MAX_AGE, secure: process.env.NODE_ENV === "production" });
}

export async function destroySession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) await updateDb((db) => { db.sessions = db.sessions.filter((s) => s.token !== token); });
  jar.delete(COOKIE);
}

export async function getCurrentUser(): Promise<User | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  const db = await readDb();
  const s = db.sessions.find((x) => x.token === token && x.expiresAt > new Date().toISOString());
  if (!s) return null;
  return db.users.find((u) => u.id === s.userId) ?? null;
}

export async function requireRole(role: Role, next = "/"): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(next)}`);
  if (user.role !== role) redirect(homeFor(user.role));
  return user;
}

export async function requireTeller(): Promise<{ user: User; teller: Teller }> {
  const user = await requireRole("teller", "/teller");
  const teller = (await readDb()).tellers.find((t) => t.userId === user.id);
  if (!teller) redirect("/");
  return { user, teller };
}

export function homeFor(role: Role): string {
  return role === "admin" ? "/admin" : role === "teller" ? "/teller" : "/mypage";
}
