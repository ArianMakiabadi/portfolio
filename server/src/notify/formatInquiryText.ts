import type { Inquiry } from "../inquiry.js";

// Plain text (Telegram gets no parse_mode), so Visitor input never needs escaping.
// Telegram auto-links the email, so the Owner can tap it to reply.
export function formatInquiryText(inquiry: Inquiry, receivedAt: Date): string {
  const subject = inquiry.subject || "New inquiry";
  return [
    `[Portfolio] ${subject}`,
    `From: ${inquiry.name} <${inquiry.email}>`,
    `Received: ${receivedAt.toISOString()}`,
    "",
    inquiry.message,
  ].join("\n");
}
