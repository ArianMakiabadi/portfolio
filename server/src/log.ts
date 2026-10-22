import { createHmac, randomBytes } from "node:crypto";

// Later tickets add "honeypot" | "invalid" | "rate_limited" | "send_failed".
export type InquiryOutcome = "sent";

// Keyed so the small IPv4 space can't be brute-forced back from the logs.
// Without IP_HASH_SECRET the key is per-process: hashes only correlate until restart.
const IP_HASH_KEY = process.env.IP_HASH_SECRET ?? randomBytes(32);

// Hashed so logs can correlate repeat senders without storing raw IPs.
export function hashIp(ip: string): string {
  return createHmac("sha256", IP_HASH_KEY)
    .update(ip)
    .digest("hex")
    .slice(0, 16);
}

// Never pass message bodies or Visitor emails through here.
export function formatOutcome(ip: string, outcome: InquiryOutcome): string {
  return JSON.stringify({
    time: new Date().toISOString(),
    ip: hashIp(ip),
    outcome,
  });
}
