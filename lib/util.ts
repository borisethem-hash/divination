import crypto from "crypto";

export function uid(prefix = ""): string {
  return prefix + crypto.randomBytes(6).toString("hex");
}

export function nowIso(): string {
  return new Date().toISOString();
}
