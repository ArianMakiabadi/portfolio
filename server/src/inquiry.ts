import { z } from "zod";
import type { MailAddresses, MailMessage } from "./mail/transport.js";

const NAME_REQUIRED = "Please enter your name.";
const EMAIL_REQUIRED = "Please enter your email address.";
const MESSAGE_REQUIRED = "Please enter a message.";

// The frontend mirrors these: maxLength on the inputs, MESSAGE_MAX_LENGTH in useContactForm.
const FIELD_MAX_LENGTH = 200;
const MESSAGE_MAX_LENGTH = 1000;

function tooLong(label: string, max: number) {
  return `${label} must be ${max} characters or fewer.`;
}

const inquirySchema = z.object({
  name: z
    .string({ error: NAME_REQUIRED })
    .trim()
    .min(1, NAME_REQUIRED)
    .max(FIELD_MAX_LENGTH, tooLong("Name", FIELD_MAX_LENGTH)),
  email: z
    .string({ error: EMAIL_REQUIRED })
    .trim()
    .min(1, EMAIL_REQUIRED)
    .max(FIELD_MAX_LENGTH, tooLong("Email", FIELD_MAX_LENGTH))
    .pipe(z.email("Please enter a valid email address.")),
  subject: z
    .string()
    .trim()
    .max(FIELD_MAX_LENGTH, tooLong("Subject", FIELD_MAX_LENGTH))
    .optional(),
  message: z
    .string({ error: MESSAGE_REQUIRED })
    .trim()
    .min(1, MESSAGE_REQUIRED)
    .max(MESSAGE_MAX_LENGTH, tooLong("Message", MESSAGE_MAX_LENGTH)),
});

// Duplicated in the frontend (src/types/inquiry.ts) on purpose: no shared package.
// subject is optional here (the API accepts it missing); the form always sends it.
export type Inquiry = z.infer<typeof inquirySchema>;

export type InquiryFieldErrors = Partial<Record<keyof Inquiry, string>>;

// First message per field: the window shows one error next to each input.
export function validateInquiry(
  body: unknown,
): { ok: true; inquiry: Inquiry } | { ok: false; errors: InquiryFieldErrors } {
  const result = inquirySchema.safeParse(body);
  if (result.success) return { ok: true, inquiry: result.data };

  const { fieldErrors } = z.flattenError(result.error);
  const errors: InquiryFieldErrors = {};
  for (const [field, messages] of Object.entries(fieldErrors)) {
    if (messages?.[0]) errors[field as keyof Inquiry] = messages[0];
  }
  return { ok: false, errors };
}

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
