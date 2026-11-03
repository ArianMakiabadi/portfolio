import { describe, expect, it } from "vitest";
import request from "supertest";
import { createApp, HOUR_MS } from "../src/app.js";
import type { Inquiry } from "../src/inquiry.js";
import type { InquiryTransport } from "../src/notify/transport.js";

// Records every send attempt; with failSend it then throws like a failed delivery.
function createStubTransport(failSend: boolean) {
  const sent: { inquiry: Inquiry; receivedAt: Date }[] = [];
  const transport: InquiryTransport = {
    async send(inquiry, receivedAt) {
      sent.push({ inquiry, receivedAt });
      if (failSend) {
        throw new Error("Telegram sendMessage failed: 401 Unauthorized");
      }
    },
  };
  return { transport, sent };
}

function createTestApp({
  failSend = false,
  now,
}: { failSend?: boolean; now?: () => number } = {}) {
  const { transport, sent } = createStubTransport(failSend);
  const logLines: string[] = [];
  const app = createApp({
    transport,
    log: (line) => logLines.push(line),
    now,
  });
  return { app, sent, logLines };
}

describe("GET /api/health", () => {
  it("returns 200 ok", async () => {
    const { app } = createTestApp();
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });
});

const validInquiry = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  subject: "Hello",
  message: "I'd like to work with you.",
  website: "",
};

describe("POST /api/inquiries", () => {
  it("hands the validated inquiry to the transport exactly once", async () => {
    const { app, sent } = createTestApp();
    const before = Date.now();

    const res = await request(app)
      .post("/api/inquiries")
      .send({ ...validInquiry, name: "  Ada Lovelace  " });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
    expect(sent).toHaveLength(1);
    // Trimmed, and the honeypot field never reaches the transport.
    expect(sent[0].inquiry).toEqual({
      name: "Ada Lovelace",
      email: "ada@example.com",
      subject: "Hello",
      message: "I'd like to work with you.",
    });
    expect(sent[0].receivedAt.getTime()).toBeGreaterThanOrEqual(before);
    expect(sent[0].receivedAt.getTime()).toBeLessThanOrEqual(Date.now());
  });

  it("logs one outcome line without personal data", async () => {
    const { app, logLines } = createTestApp();

    await request(app)
      .post("/api/inquiries")
      .set("X-Forwarded-For", "203.0.113.7")
      .send(validInquiry);

    expect(logLines).toHaveLength(1);
    const entry = JSON.parse(logLines[0]);
    expect(Object.keys(entry).sort()).toEqual(["ip", "outcome", "time"]);
    expect(entry.outcome).toBe("sent");
    expect(new Date(entry.time).toISOString()).toBe(entry.time);
    expect(entry.ip).toMatch(/^[0-9a-f]{16}$/);
    expect(logLines[0]).not.toContain("203.0.113.7");
    expect(logLines[0]).not.toContain(validInquiry.email);
    expect(logLines[0]).not.toContain(validInquiry.message);
  });
});

describe("POST /api/inquiries delivery failure", () => {
  it("responds 502 send_failed when the transport throws", async () => {
    const { app, sent } = createTestApp({ failSend: true });

    const res = await request(app).post("/api/inquiries").send(validInquiry);

    expect(sent).toHaveLength(1);
    expect(res.status).toBe(502);
    expect(res.body).toEqual({ error: "send_failed" });
  });

  it("logs a send_failed outcome without personal data", async () => {
    const { app, logLines } = createTestApp({ failSend: true });

    await request(app).post("/api/inquiries").send(validInquiry);

    expect(logLines).toHaveLength(1);
    expect(JSON.parse(logLines[0]).outcome).toBe("send_failed");
    expect(logLines[0]).not.toContain(validInquiry.email);
    expect(logLines[0]).not.toContain(validInquiry.message);
  });
});

describe("POST /api/inquiries validation", () => {
  async function postExpectingFieldError(
    overrides: Record<string, unknown>,
    field: string,
    message: string,
  ) {
    const { app, sent } = createTestApp();
    const res = await request(app)
      .post("/api/inquiries")
      .send({ ...validInquiry, ...overrides });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ errors: { [field]: message } });
    expect(sent).toHaveLength(0);
  }

  it("rejects a missing name", () =>
    postExpectingFieldError({ name: "" }, "name", "Please enter your name."));

  it("rejects an absent name key", () =>
    postExpectingFieldError(
      { name: undefined },
      "name",
      "Please enter your name.",
    ));

  it("rejects a name over 200 characters", () =>
    postExpectingFieldError(
      { name: "a".repeat(201) },
      "name",
      "Name must be 200 characters or fewer.",
    ));

  it("rejects a missing email", () =>
    postExpectingFieldError(
      { email: "" },
      "email",
      "Please enter your email address.",
    ));

  it("rejects a malformed email", () =>
    postExpectingFieldError(
      { email: "ada.example.com" },
      "email",
      "Please enter a valid email address.",
    ));

  it("rejects an email over 200 characters", () =>
    postExpectingFieldError(
      // 189 + "@example.com" (12) = 201 characters, otherwise well-formed.
      { email: `${"a".repeat(189)}@example.com` },
      "email",
      "Email must be 200 characters or fewer.",
    ));

  it("rejects a subject over 200 characters", () =>
    postExpectingFieldError(
      { subject: "s".repeat(201) },
      "subject",
      "Subject must be 200 characters or fewer.",
    ));

  it("rejects a missing message", () =>
    postExpectingFieldError(
      { message: "   " },
      "message",
      "Please enter a message.",
    ));

  it("rejects a message over 1000 characters", () =>
    postExpectingFieldError(
      { message: "m".repeat(1001) },
      "message",
      "Message must be 1000 characters or fewer.",
    ));

  it("logs an invalid outcome without personal data", async () => {
    const { app, logLines } = createTestApp();

    await request(app)
      .post("/api/inquiries")
      .set("X-Forwarded-For", "203.0.113.7")
      .send({ ...validInquiry, email: "ada.example.com" });

    expect(logLines).toHaveLength(1);
    const entry = JSON.parse(logLines[0]);
    expect(Object.keys(entry).sort()).toEqual(["ip", "outcome", "time"]);
    expect(entry.outcome).toBe("invalid");
    expect(logLines[0]).not.toContain("203.0.113.7");
    expect(logLines[0]).not.toContain("ada.example.com");
    expect(logLines[0]).not.toContain(validInquiry.message);
  });

  it("rejects a body over 16kb before validating it", async () => {
    const { app, sent } = createTestApp();

    const res = await request(app)
      .post("/api/inquiries")
      .send({ ...validInquiry, message: "m".repeat(20_000) });

    expect(res.status).toBe(413);
    expect(res.body).toEqual({ error: "payload_too_large" });
    expect(sent).toHaveLength(0);
  });
});

describe("POST /api/inquiries honeypot", () => {
  it("answers 200 ok and sends nothing when the website field is filled", async () => {
    const { app, sent, logLines } = createTestApp();

    const res = await request(app)
      .post("/api/inquiries")
      .send({ ...validInquiry, website: "https://spam.example" });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
    expect(sent).toHaveLength(0);
    expect(logLines).toHaveLength(1);
    expect(JSON.parse(logLines[0]).outcome).toBe("honeypot");
  });
});

describe("POST /api/inquiries rate limit", () => {
  function postFrom(
    app: ReturnType<typeof createApp>,
    forwardedFor: string,
    body: Record<string, unknown> = validInquiry,
  ) {
    return request(app)
      .post("/api/inquiries")
      .set("X-Forwarded-For", forwardedFor)
      .send(body);
  }

  it("answers 429 to the 6th Inquiry from one IP within an hour", async () => {
    let clock = 0;
    const { app, sent, logLines } = createTestApp({ now: () => clock });

    for (let i = 0; i < 5; i++) {
      clock += 10 * 60 * 1000 - 1;
      expect((await postFrom(app, "203.0.113.7")).status).toBe(200);
    }
    const res = await postFrom(app, "203.0.113.7");

    expect(res.status).toBe(429);
    expect(res.body).toEqual({ error: "rate_limited" });
    expect(sent).toHaveLength(5);
    expect(JSON.parse(logLines.at(-1)!).outcome).toBe("rate_limited");
  });

  it("allows the IP again once its oldest Inquiry is an hour old", async () => {
    let clock = 0;
    const { app } = createTestApp({ now: () => clock });

    for (let i = 0; i < 5; i++) await postFrom(app, "203.0.113.7");
    clock = HOUR_MS - 1;
    expect((await postFrom(app, "203.0.113.7")).status).toBe(429);
    clock = HOUR_MS;
    expect((await postFrom(app, "203.0.113.7")).status).toBe(200);
  });

  it("does not count invalid or honeypot requests", async () => {
    const { app } = createTestApp();

    for (let i = 0; i < 5; i++) {
      await postFrom(app, "203.0.113.7", { ...validInquiry, email: "" });
      await postFrom(app, "203.0.113.7", { ...validInquiry, website: "x" });
    }

    expect((await postFrom(app, "203.0.113.7")).status).toBe(200);
  });

  it("does not count Inquiries whose delivery failed", async () => {
    const { app } = createTestApp({ failSend: true });

    for (let i = 0; i < 5; i++) await postFrom(app, "203.0.113.7");

    // The error box says "try again later": a retry must not hit the limit.
    expect((await postFrom(app, "203.0.113.7")).status).toBe(502);
  });

  it("keys on the client IP the one trusted proxy hop reports", async () => {
    const { app } = createTestApp();

    // Nginx appends the real client IP; anything left of it is client-supplied.
    for (let i = 0; i < 5; i++) {
      await postFrom(app, `198.51.100.${i}, 203.0.113.7`);
    }

    expect((await postFrom(app, "198.51.100.99, 203.0.113.7")).status).toBe(
      429,
    );
    expect((await postFrom(app, "203.0.113.8")).status).toBe(200);
  });
});
