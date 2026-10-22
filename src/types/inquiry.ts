// Mirrors server/src/inquiry.ts on purpose: no shared package between the two.
export type Inquiry = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

// Body of a 400 from POST /api/inquiries: one message per invalid field.
export type InquiryFieldErrors = Partial<Record<keyof Inquiry, string>>;
