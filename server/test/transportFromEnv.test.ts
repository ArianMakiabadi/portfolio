import { afterEach, describe, expect, it, vi } from "vitest";
import {
  telegramConfigFromEnv,
  timeZoneFromEnv,
  transportFromEnv,
} from "../src/notify/transportFromEnv.js";

describe("telegramConfigFromEnv", () => {
  it("builds a Telegram config when both vars are set", () => {
    expect(
      telegramConfigFromEnv({
        TELEGRAM_BOT_TOKEN: "123:abc",
        TELEGRAM_CHAT_ID: "42",
      }),
    ).toEqual({ botToken: "123:abc", chatId: "42" });
  });

  it("returns null without Telegram vars, so the console transport is used", () => {
    expect(telegramConfigFromEnv({})).toBeNull();
  });

  it("treats blank vars as unset", () => {
    expect(
      telegramConfigFromEnv({ TELEGRAM_BOT_TOKEN: "", TELEGRAM_CHAT_ID: "" }),
    ).toBeNull();
  });

  // Falling back to the console would silently drop Inquiries.
  it("rejects only the token being set, naming the missing var", () => {
    expect(() =>
      telegramConfigFromEnv({ TELEGRAM_BOT_TOKEN: "123:abc" }),
    ).toThrow(/TELEGRAM_CHAT_ID/);
  });

  it("rejects only the chat id being set, naming the missing var", () => {
    expect(() =>
      telegramConfigFromEnv({ TELEGRAM_BOT_TOKEN: "", TELEGRAM_CHAT_ID: "42" }),
    ).toThrow(/TELEGRAM_BOT_TOKEN/);
  });
});

describe("timeZoneFromEnv", () => {
  it("defaults to UTC, treating blank as unset", () => {
    expect(timeZoneFromEnv({})).toBe("UTC");
    expect(timeZoneFromEnv({ OWNER_TZ: "" })).toBe("UTC");
  });

  it("returns a valid OWNER_TZ", () => {
    expect(timeZoneFromEnv({ OWNER_TZ: "Europe/Berlin" })).toBe(
      "Europe/Berlin",
    );
  });
});

describe("transportFromEnv", () => {
  afterEach(() => vi.restoreAllMocks());

  const inquiry = { name: "Ada", email: "ada@example.com", message: "Hi" };

  it("uses the console transport without Telegram vars", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    await transportFromEnv({}).send(inquiry, new Date());

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(log.mock.calls.flat().join("\n")).toContain("👤 <b>Ada</b>");
  });

  it("uses the Telegram transport when both vars are set", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(Response.json({ ok: true }));

    await transportFromEnv({
      TELEGRAM_BOT_TOKEN: "123:abc",
      TELEGRAM_CHAT_ID: "42",
    }).send(inquiry, new Date());

    expect(fetchSpy).toHaveBeenCalledWith(
      "https://api.telegram.org/bot123:abc/sendMessage",
      expect.anything(),
    );
  });

  // The console transport prints Visitor emails and messages: never in prod logs.
  it("refuses the console fallback in production", () => {
    expect(() => transportFromEnv({ NODE_ENV: "production" })).toThrow(
      /TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID are required in production/,
    );
  });

  it("refuses to start with an invalid OWNER_TZ", () => {
    expect(() => transportFromEnv({ OWNER_TZ: "Mars/Olympus" })).toThrow(
      /OWNER_TZ/,
    );
  });

  it("refuses to start with only one var set", () => {
    expect(() => transportFromEnv({ TELEGRAM_CHAT_ID: "42" })).toThrow(
      /TELEGRAM_BOT_TOKEN/,
    );
  });
});
