# 07: Friendlier Telegram message layout

**What to build:** The Telegram message for each Inquiry is easier to scan: a bold header with the subject, the Visitor's name, email and received time each on their own emoji-labelled line, and the message set off in a blockquote. See spec §4 "Delivery to the Owner (Telegram)".

- Send with `parse_mode: "HTML"`; HTML-escape every Visitor field.
- Time shown as `4 Nov 2026, 15:32` in `OWNER_TZ` (IANA name, default UTC); invalid zone fails at startup.
- Console transport prints the same HTML text.

**Blocked by:** 03 (Telegram delivery to the Owner)

**Status:** ready-for-human

- [x] Formatter produces the spec layout; no subject → `📨 New inquiry`
- [x] Name, email, subject and message are HTML-escaped
- [x] Time rendered in `OWNER_TZ`; unset/blank → UTC; invalid → startup error
- [x] Telegram request includes `parse_mode: "HTML"`
- [x] `.env.example` and spec document `OWNER_TZ`
- [ ] Live check: message renders as designed in Telegram (bold, blockquote, tappable email), including a message with `<`, `&`
- [x] `npm --prefix server test`, `npm --prefix server run typecheck` pass

## Comments

- `formatInquiryText.ts` renamed to `server/src/notify/formatInquiryMessage.ts` (also exports `escapeHtml`, `formatReceivedAt`). `timeZoneFromEnv` lives in `transportFromEnv.ts`.
