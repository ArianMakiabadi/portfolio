import express, { type ErrorRequestHandler } from "express";
import { buildInquiryEmail, validateInquiry } from "./inquiry.js";
import { formatOutcome, type InquiryOutcome } from "./log.js";
import type { MailAddresses, MailTransport } from "./mail/transport.js";

export type AppDeps = {
  transport: MailTransport;
  mail: MailAddresses;
  log: (line: string) => void;
};

export function createApp({ transport, mail, log }: AppDeps) {
  const app = express();

  // Behind Nginx: req.ip is the Visitor's address, not the proxy's.
  app.set("trust proxy", 1);
  app.use(express.json({ limit: "16kb" }));

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true });
  });

  app.post("/api/inquiries", async (req, res) => {
    const logOutcome = (outcome: InquiryOutcome) =>
      log(formatOutcome(req.ip ?? "unknown", outcome));

    const result = validateInquiry(req.body);
    if (!result.ok) {
      logOutcome("invalid");
      res.status(400).json({ errors: result.errors });
      return;
    }

    await transport.send(buildInquiryEmail(result.inquiry, mail, new Date()));
    logOutcome("sent");
    res.json({ ok: true });
  });

  app.use(jsonBodyErrors);

  return app;
}

// express.json() errors would otherwise reach Express's default HTML handler.
const jsonBodyErrors: ErrorRequestHandler = (err, _req, res, next) => {
  if (err?.type === "entity.too.large") {
    res.status(413).json({ error: "payload_too_large" });
    return;
  }
  next(err);
};
