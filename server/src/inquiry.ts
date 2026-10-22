import type { MailAddresses, MailMessage } from "./mail/transport.js";

// Duplicated in the frontend (src/types/inquiry.ts) on purpose: no shared package.
// subject is optional here (the API accepts it missing); the form always sends it.
export type Inquiry = {
  name: string;
  email: string;
  subject?: string;
  message: string;
};

export function buildInquiryEmail(
  inquiry: Inquiry,
  addresses: MailAddresses,
  receivedAt: Date,
): MailMessage {
  const subject = inquiry.subject?.trim() || "New inquiry";

  return {
    from: addresses.from,
    to: addresses.to,
    replyTo: inquiry.email,
    subject: `[Portfolio] ${subject}`,
    text: [
      `Name: ${inquiry.name}`,
      `Email: ${inquiry.email}`,
      `Received: ${receivedAt.toISOString()}`,
      "",
      inquiry.message,
    ].join("\n"),
  };
}
