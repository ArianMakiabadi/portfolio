import { describe, expect, it } from "vitest";
import type { Inquiry } from "../src/inquiry.js";
import {
  escapeHtml,
  formatInquiryMessage,
  formatReceivedAt,
} from "../src/notify/formatInquiryMessage.js";

const inquiry: Inquiry = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  subject: "Hello",
  message: "I'd like to work with you.\nThanks!",
};
const receivedAt = new Date("2026-11-03T10:00:00.000Z");

describe("formatInquiryMessage", () => {
  it("lays out the header, sender, time and quoted message", () => {
    expect(formatInquiryMessage(inquiry, receivedAt, "UTC")).toBe(
      [
        "<b>📨 New inquiry — Hello</b>",
        "",
        "👤 <b>Ada Lovelace</b>",
        "✉️ ada@example.com",
        "🕒 3 Nov 2026, 10:00",
        "",
        "━━━━━━━━━━",
        "<blockquote>I'd like to work with you.\nThanks!</blockquote>",
      ].join("\n"),
    );
  });

  it("drops the subject from the header when there is none", () => {
    for (const subject of [undefined, ""]) {
      expect(
        formatInquiryMessage({ ...inquiry, subject }, receivedAt, "UTC").split(
          "\n",
        )[0],
      ).toBe("<b>📨 New inquiry</b>");
    }
  });

  it("escapes HTML in every Visitor field", () => {
    const text = formatInquiryMessage(
      {
        name: "<b>Eve</b>",
        email: "a&b@example.com",
        subject: "</b><i>x",
        message: "1 < 2 && 3 > 2 </blockquote>",
      },
      receivedAt,
      "UTC",
    );
    expect(text).toContain("👤 <b>&lt;b&gt;Eve&lt;/b&gt;</b>");
    expect(text).toContain("✉️ a&amp;b@example.com");
    expect(text).toContain("<b>📨 New inquiry — &lt;/b&gt;&lt;i&gt;x</b>");
    expect(text).toContain(
      "<blockquote>1 &lt; 2 &amp;&amp; 3 &gt; 2 &lt;/blockquote&gt;</blockquote>",
    );
  });

  it("shows the time in the Owner's timezone", () => {
    expect(
      formatInquiryMessage(inquiry, receivedAt, "Europe/Berlin"),
    ).toContain("🕒 3 Nov 2026, 11:00");
  });
});

describe("escapeHtml", () => {
  it("escapes & first so entities aren't double-escaped wrongly", () => {
    expect(escapeHtml("&lt;")).toBe("&amp;lt;");
  });
});

describe("formatReceivedAt", () => {
  it("throws on an unknown timezone", () => {
    expect(() => formatReceivedAt(receivedAt, "Mars/Olympus")).toThrow(
      RangeError,
    );
  });
});
