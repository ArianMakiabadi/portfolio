import { formatInquiryText } from "./formatInquiryText.js";
import type { InquiryTransport } from "./transport.js";

// Local-dev stand-in for Telegram: prints the would-be message instead of sending it.
export function createConsoleTransport(): InquiryTransport {
  return {
    async send(inquiry, receivedAt) {
      console.log(
        [
          "----- outgoing Telegram message (console transport) -----",
          formatInquiryText(inquiry, receivedAt),
          "----------------------------------------------------------",
        ].join("\n"),
      );
    },
  };
}
