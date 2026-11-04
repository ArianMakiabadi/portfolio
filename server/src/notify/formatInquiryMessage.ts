import type { Inquiry } from "../inquiry.js";

// Telegram HTML (parse_mode: "HTML"). Every Visitor field goes through escapeHtml:
// a stray "<" would otherwise make Telegram reject the message (→ 502).
// The email stays plain text; Telegram auto-links it so the Owner can tap to reply.
export function formatInquiryMessage(
  inquiry: Inquiry,
  receivedAt: Date,
  timeZone: string,
): string {
  const header = inquiry.subject
    ? `📨 New inquiry — ${escapeHtml(inquiry.subject)}`
    : "📨 New inquiry";
  return [
    `<b>${header}</b>`,
    "",
    `👤 <b>${escapeHtml(inquiry.name)}</b>`,
    `✉️ ${escapeHtml(inquiry.email)}`,
    `🕒 ${formatReceivedAt(receivedAt, timeZone)}`,
    "",
    "━━━━━━━━━━",
    `<blockquote>${escapeHtml(inquiry.message)}</blockquote>`,
  ].join("\n");
}

// Telegram's HTML mode only needs these three escaped.
export function escapeHtml(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

// "4 Nov 2026, 15:32" in the Owner's timezone. Throws RangeError on an unknown zone.
export function formatReceivedAt(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone,
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(date);
}
