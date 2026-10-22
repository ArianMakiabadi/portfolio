// Mirrors server/src/inquiry.ts on purpose: no shared package between the two.
export type Inquiry = {
  name: string;
  email: string;
  subject: string;
  message: string;
};
