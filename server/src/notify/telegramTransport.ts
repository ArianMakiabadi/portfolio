import { formatInquiryMessage } from "./formatInquiryMessage.js";
import type { InquiryTransport } from "./transport.js";

export type TelegramConfig = {
  botToken: string;
  chatId: string;
};

// The Visitor is watching a busy cursor: give up quickly and answer 502.
const REQUEST_TIMEOUT_MS = 10_000;

type TelegramResponse = { ok: boolean; description?: string };

// Bot API sendMessage over plain fetch. Any failure throws (→ 502); no retries.
export function createTelegramTransport(
  config: TelegramConfig,
  timeZone: string,
  fetchFn: typeof fetch = fetch,
): InquiryTransport {
  // The URL holds the token: never let it reach an error message.
  const url = `https://api.telegram.org/bot${config.botToken}/sendMessage`;

  return {
    async send(inquiry, receivedAt) {
      try {
        const response = await fetchFn(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: config.chatId,
            text: formatInquiryMessage(inquiry, receivedAt, timeZone),
            parse_mode: "HTML",
          }),
          signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        });
        const body = (await response
          .json()
          .catch(() => null)) as TelegramResponse | null;
        if (!response.ok || !body?.ok) {
          // Telegram's description (e.g. "chat not found") never echoes the message.
          throw new Error(
            `Telegram sendMessage failed: ${response.status} ${body?.description ?? ""}`.trim(),
          );
        }
      } catch (error) {
        // The outcome log stays a bare "send_failed"; the reason goes here for ops.
        console.error((error as Error).message);
        throw error;
      }
    },
  };
}
