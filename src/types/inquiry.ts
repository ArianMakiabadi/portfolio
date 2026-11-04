// Mirrors server/src/inquiry.ts on purpose: no shared package between the two.
export type Inquiry = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

// What the Contact window posts: the Inquiry plus the honeypot field, which real
// Visitors never see and so leave empty (server/src/app.ts drops filled ones).
export type InquiryRequest = Inquiry & { website: string };

// Which error box the Contact window shows; the draft is kept either way.
export type SendError = "rate_limited" | "failed";

// Body of a 400 from POST /api/inquiries: one message per invalid field.
export type InquiryFieldErrors = Partial<Record<keyof Inquiry, string>>;
