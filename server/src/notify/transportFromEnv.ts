import { createConsoleTransport } from "./consoleTransport.js";
import {
  createTelegramTransport,
  type TelegramConfig,
} from "./telegramTransport.js";
import type { InquiryTransport } from "./transport.js";

type Env = Record<string, string | undefined>;

const TELEGRAM_VARS = ["TELEGRAM_BOT_TOKEN", "TELEGRAM_CHAT_ID"] as const;

// Neither var → null (console transport). Only one throws at startup instead:
// falling back would print Inquiries to the log and drop them.
export function telegramConfigFromEnv(env: Env): TelegramConfig | null {
  const missing = TELEGRAM_VARS.filter((name) => !env[name]);
  if (missing.length === TELEGRAM_VARS.length) return null;
  if (missing.length > 0) {
    throw new Error(
      `Telegram is partly configured; missing ${missing.join(", ")}`,
    );
  }
  return {
    botToken: env.TELEGRAM_BOT_TOKEN!,
    chatId: env.TELEGRAM_CHAT_ID!,
  };
}

export function transportFromEnv(env: Env): InquiryTransport {
  const config = telegramConfigFromEnv(env);
  if (!config) {
    // The console transport prints Visitor emails and messages; on the VPS that
    // would put them in journald and drop the Inquiry. Fail fast instead.
    if (env.NODE_ENV === "production") {
      throw new Error(
        "TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID are required in production",
      );
    }
    console.log("Telegram not configured: using the console transport.");
    return createConsoleTransport();
  }
  return createTelegramTransport(config);
}
