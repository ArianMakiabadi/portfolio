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
