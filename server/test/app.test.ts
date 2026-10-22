import { describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../src/app.js";
import type { MailMessage, MailTransport } from "../src/mail/transport.js";

function createStubTransport() {
  const sent: MailMessage[] = [];
  const transport: MailTransport = {
    async send(message) {
      sent.push(message);
    },
  };
  return { transport, sent };
}

function createTestApp() {
  const { transport, sent } = createStubTransport();
  const logLines: string[] = [];
  const app = createApp({
    transport,
    mail: { from: "portfolio@example.com", to: "owner@example.com" },
    log: (line) => logLines.push(line),
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
  it("delivers a valid inquiry to the owner exactly once", async () => {
    const { app, sent } = createTestApp();

    const res = await request(app).post("/api/inquiries").send(validInquiry);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
    expect(sent).toHaveLength(1);
    expect(sent[0]).toMatchObject({
      from: "portfolio@example.com",
      to: "owner@example.com",
      replyTo: "ada@example.com",
      subject: "[Portfolio] Hello",
    });
    expect(sent[0].text).toContain("Ada Lovelace");
    expect(sent[0].text).toContain("ada@example.com");
    expect(sent[0].text).toContain("I'd like to work with you.");
  });

  it("uses a default subject when none is given", async () => {
    const { app, sent } = createTestApp();

    await request(app)
      .post("/api/inquiries")
      .send({ ...validInquiry, subject: "" });

    expect(sent[0].subject).toBe("[Portfolio] New inquiry");
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
