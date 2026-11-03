import { describe, expect, it } from "vitest";
import type { Inquiry } from "../src/inquiry.js";
import { formatInquiryText } from "../src/notify/formatInquiryText.js";

const inquiry: Inquiry = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  subject: "Hello",
  message: "I'd like to work with you.\nThanks!",
};
const receivedAt = new Date("2026-11-03T10:00:00.000Z");

describe("formatInquiryText", () => {
  it("lays out the subject, sender, timestamp and message", () => {
    expect(formatInquiryText(inquiry, receivedAt)).toBe(
      [
        "[Portfolio] Hello",
        "From: Ada Lovelace <ada@example.com>",
        "Received: 2026-11-03T10:00:00.000Z",
        "",
        "I'd like to work with you.\nThanks!",
      ].join("\n"),
    );
  });

  it("falls back to 'New inquiry' without a subject", () => {
    for (const subject of [undefined, ""]) {
      expect(
        formatInquiryText({ ...inquiry, subject }, receivedAt).split("\n")[0],
      ).toBe("[Portfolio] New inquiry");
    }
  });
});
