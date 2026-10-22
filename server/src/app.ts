import express from "express";
import { buildInquiryEmail, type Inquiry } from "./inquiry.js";
import { formatOutcome } from "./log.js";
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
    // Validation lands with zod in a later ticket; trust the shape for now.
    const inquiry = req.body as Inquiry;
    await transport.send(buildInquiryEmail(inquiry, mail, new Date()));
    log(formatOutcome(req.ip ?? "unknown", "sent"));
    res.json({ ok: true });
  });

  return app;
}
