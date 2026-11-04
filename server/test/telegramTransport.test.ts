import { describe, expect, it } from "vitest";
import type { Inquiry } from "../src/inquiry.js";
import { formatInquiryMessage } from "../src/notify/formatInquiryMessage.js";
import { createTelegramTransport } from "../src/notify/telegramTransport.js";

const inquiry: Inquiry = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  subject: "Hello",
  message: "I'd like to work with you.\nThanks!",
};
const receivedAt = new Date("2026-11-03T10:00:00.000Z");

type FetchCall = { url: string; init: RequestInit };

function stubFetch(respond: () => Promise<Response>) {
  const calls: FetchCall[] = [];
  const fetchFn = (async (url: string, init: RequestInit) => {
    calls.push({ url, init });
    return respond();
  }) as typeof fetch;
  return { fetchFn, calls };
}

const config = { botToken: "123:abc", chatId: "42" };

describe("createTelegramTransport", () => {
  it("posts the HTML message to sendMessage for the chat", async () => {
    const { fetchFn, calls } = stubFetch(async () =>
      Response.json({ ok: true, result: {} }),
    );

    await createTelegramTransport(config, "UTC", fetchFn).send(
      inquiry,
      receivedAt,
    );

    expect(calls).toHaveLength(1);
    expect(calls[0].url).toBe(
      "https://api.telegram.org/bot123:abc/sendMessage",
    );
    expect(calls[0].init.method).toBe("POST");
    expect(calls[0].init.signal).toBeInstanceOf(AbortSignal);
    const body = JSON.parse(calls[0].init.body as string);
    expect(body).toEqual({
      chat_id: "42",
      text: formatInquiryMessage(inquiry, receivedAt, "UTC"),
      parse_mode: "HTML",
    });
  });

  it("throws when Telegram answers ok: false", async () => {
    const { fetchFn } = stubFetch(async () =>
      Response.json({ ok: false, description: "Bad Request: chat not found" }),
    );
    await expect(
      createTelegramTransport(config, "UTC", fetchFn).send(inquiry, receivedAt),
    ).rejects.toThrow(/chat not found/);
  });

  it("throws on a non-2xx status", async () => {
    const { fetchFn } = stubFetch(
      async () => new Response("Unauthorized", { status: 401 }),
    );
    await expect(
      createTelegramTransport(config, "UTC", fetchFn).send(inquiry, receivedAt),
    ).rejects.toThrow(/401/);
  });

  it("throws on a network error", async () => {
    const { fetchFn } = stubFetch(async () => {
      throw new TypeError("fetch failed");
    });
    await expect(
      createTelegramTransport(config, "UTC", fetchFn).send(inquiry, receivedAt),
    ).rejects.toThrow(/fetch failed/);
  });

  it("throws when the request times out", async () => {
    const { fetchFn } = stubFetch(async () => {
      throw new DOMException(
        "The operation was aborted due to timeout",
        "TimeoutError",
      );
    });
    await expect(
      createTelegramTransport(config, "UTC", fetchFn).send(inquiry, receivedAt),
    ).rejects.toThrow(/timeout/);
  });

  it("never puts the bot token in the thrown error", async () => {
    const { fetchFn } = stubFetch(
      async () => new Response("Not Found", { status: 404 }),
    );
    await expect(
      createTelegramTransport(config, "UTC", fetchFn).send(inquiry, receivedAt),
    ).rejects.not.toThrow(/123:abc/);
  });
});
