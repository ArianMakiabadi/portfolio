# 03: Telegram delivery to the Owner

**What to build:** Each Inquiry arrives as a Telegram message from the Owner's bot. The message shows the Visitor's email, which Telegram auto-links so the Owner can reply from their mail client. If delivery fails, the Visitor sees an XP error box and keeps their draft. See spec §4 "Delivery to the Owner (Telegram)" and "Delivery seam".

- Reshape the seam: the transport takes `send(inquiry, receivedAt)` instead of an email (`MailMessage`). Each transport formats its own output. Move it from `server/src/mail/` to `server/src/notify/`. Drop `MailAddresses`, `buildInquiryEmail` and the from/to wiring in `app.ts`/`index.ts`.
- Telegram transport: plain `fetch` to `sendMessage`, plain text (no `parse_mode`), chat id from env. The layout is in the spec. Throws on `ok: false`, non-2xx, network error, or a 10s timeout (`AbortSignal.timeout`). No retries.
- Console transport: prints the same text the Telegram message would contain.
- `transportFromEnv`: `TELEGRAM_BOT_TOKEN` + `TELEGRAM_CHAT_ID`. Neither set → console. Only one set → throw at startup. Both → Telegram.
- Transport failure → `502 { error: "send_failed" }`, log outcome `send_failed`.
- Contact window: 502, other 5xx and network errors → XP error box with a generic failure message; draft kept.
- Delete all Gmail work (uncommitted, no backup wanted): `gmailTransport.ts`, `mime.ts`, `scripts/gmailAuth.ts`, `gmailTransport.test.ts`, `mime.test.ts`, the `gmail:auth` npm script and any deps it needed, and the `GMAIL_*`/`INQUIRY_FROM`/`INQUIRY_TO` vars.
- `server/.env.example`: Telegram vars plus one-time setup (create the bot with @BotFather, message it, open `https://api.telegram.org/bot<TOKEN>/getUpdates`, copy `chat.id`). Real `.env` gitignored.

**Blocked by:** 01 (Send an Inquiry end-to-end)

**Status:** ready-for-human

- [ ] With Telegram env set, a sent Inquiry arrives in the Owner's chat with the spec's layout
- [x] Without Telegram env, the console transport still works (`npm run dev:all`)
- [x] Only one Telegram var set → server refuses to start with a clear message
- [x] Transport error → 502; window shows XP error box; draft kept
- [x] Network failure (backend down) → same XP error box; draft kept
- [x] No Gmail code, scripts, deps or env vars remain (`grep -ri gmail server/` is empty)
- [x] `.env.example` lists all vars; `.env` is gitignored
- [x] Tests: message text with and without subject; `ok: false`/non-2xx/network/timeout → throws; `transportFromEnv` none/one/both; app: transport throws → 502, valid Inquiry → transport called with the Inquiry
- [ ] `npm --prefix server test`, `npm --prefix server run typecheck`, `npm run build`, `npm run lint` pass

## Comments

- Implemented on `feat/contact-inquiry` (uncommitted). Code in `server/src/notify/`: `telegramTransport.ts`, `consoleTransport.ts`, `formatInquiryText.ts` (shared layout), `transportFromEnv.ts`.
- Verified locally: console transport prints the spec layout; only one Telegram var → startup error naming the missing var; bad token → `502 send_failed`. Frontend error box for 502/5xx/network was already in place from earlier work.
- Left for a human: the live Telegram send needs a real bot token + chat id. `npm run build`/`lint` fail only on the `App.tsx` dev toggle (`<Desktop />`); restore `<BootSequence />` and re-run.
- Beyond the ticket: `NODE_ENV=production` without Telegram vars refuses startup (the console fallback would put Visitor PII in journald), so ticket 06's env file must set `NODE_ENV=production`. `loadEnv.ts` now resolves `server/.env` from its own location, not the cwd.
