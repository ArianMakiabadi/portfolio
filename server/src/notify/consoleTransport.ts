import { formatInquiryMessage } from "./formatInquiryMessage.js";
import type { InquiryTransport } from "./transport.js";

// Local-dev stand-in for Telegram: prints the would-be message instead of sending it.
export function createConsoleTransport(timeZone: string): InquiryTransport {
  return {
    async send(inquiry, receivedAt) {
      console.log(
        [
          "----- outgoing Telegram message (console transport) -----",
          formatInquiryMessage(inquiry, receivedAt, timeZone),
          "----------------------------------------------------------",
        ].join("\n"),
      );
    },
  };
}
