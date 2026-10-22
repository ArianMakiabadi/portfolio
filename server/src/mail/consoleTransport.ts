import type { MailTransport } from "./transport.js";

// Local-dev stand-in for SMTP: prints the would-be email instead of sending it.
export function createConsoleTransport(): MailTransport {
  return {
    async send(message) {
      console.log(
        [
          "----- outgoing email (console transport) -----",
          `From: ${message.from}`,
          `To: ${message.to}`,
          `Reply-To: ${message.replyTo}`,
          `Subject: ${message.subject}`,
          "",
          message.text,
          "----------------------------------------------",
        ].join("\n"),
      );
    },
  };
}
