import express, { type ErrorRequestHandler } from "express";
import { validateInquiry } from "./inquiry.js";
import { formatOutcome, type InquiryOutcome } from "./log.js";
import type { InquiryTransport } from "./notify/transport.js";
import { createRateLimiter } from "./rateLimiter.js";

export type AppDeps = {
  transport: InquiryTransport;
  log: (line: string) => void;
  // Clock for the rate-limit window (ms); tests inject a fake one.
  now?: () => number;
};

const INQUIRIES_PER_IP_PER_HOUR = 5;
export const HOUR_MS = 60 * 60 * 1000;

export function createApp({ transport, log, now = Date.now }: AppDeps) {
  const app = express();
  // Only Inquiries that reach the Owner count: invalid, honeypot and failed
  // sends don't.
  const rateLimiter = createRateLimiter({
    limit: INQUIRIES_PER_IP_PER_HOUR,
    windowMs: HOUR_MS,
    now,
  });

  // Behind Nginx: req.ip is the Visitor's address (the last X-Forwarded-For
  // hop, which Nginx appends), not the proxy's. Earlier hops are client-supplied
  // and ignored, so the rate limit can't be dodged by spoofing the header.
  app.set("trust proxy", 1);
  app.use(express.json({ limit: "16kb" }));

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true });
  });

  app.post("/api/inquiries", async (req, res) => {
    const ip = req.ip ?? "unknown";
    const logOutcome = (outcome: InquiryOutcome) =>
      log(formatOutcome(ip, outcome));

    // Bots fill every field; real Visitors never see this one. Answer as if sent.
    if (isHoneypotFilled(req.body)) {
      logOutcome("honeypot");
      res.json({ ok: true });
      return;
    }

    const result = validateInquiry(req.body);
    if (!result.ok) {
      logOutcome("invalid");
      res.status(400).json({ errors: result.errors });
      return;
    }

    if (!rateLimiter.tryAcquire(ip)) {
      logOutcome("rate_limited");
      res.status(429).json({ error: "rate_limited" });
      return;
    }

    try {
      await transport.send(result.inquiry, new Date());
    } catch {
      // The Owner never got it, and the Visitor is told to retry: don't count it.
      rateLimiter.release(ip);
      logOutcome("send_failed");
      res.status(502).json({ error: "send_failed" });
      return;
    }
    logOutcome("sent");
    res.json({ ok: true });
  });

  app.use(jsonBodyErrors);

  return app;
}

function isHoneypotFilled(body: unknown): boolean {
  const website = (body as { website?: unknown } | null)?.website;
  return website !== undefined && website !== null && website !== "";
}

// express.json() errors would otherwise reach Express's default HTML handler.
const jsonBodyErrors: ErrorRequestHandler = (err, _req, res, next) => {
  if (err?.type === "entity.too.large") {
    res.status(413).json({ error: "payload_too_large" });
    return;
  }
  next(err);
};
