import type { Inquiry } from "../inquiry.js";

// Delivery boundary: the app only ever hands over the validated Inquiry, and
// each transport (Telegram, console, a test stub) formats its own output.
export type InquiryTransport = {
  send(inquiry: Inquiry, receivedAt: Date): Promise<void>;
};
