# 04: Spam protection

**What to build:** Bots that fill every field are silently ignored, and nobody can flood the Owner's inbox from one IP. Real Visitors notice nothing unless they exceed the limit, in which case they get a friendly "try again later".

- Hidden honeypot field `website` in the Contact window (visually hidden, `tabindex=-1`, `autocomplete=off`). Non-empty → server responds `200 { ok: true }` and sends nothing.
- Rate limit: 5 Inquiries per hour per IP, kept in memory. Excess → `429 { error: "rate_limited" }`.
- Express trusts exactly one proxy hop, so the limit sees the real Visitor IP behind Nginx.
- Contact window: 429 → XP error box "Too many messages, try again later"; draft kept.
- Log outcomes `honeypot` and `rate_limited`.

**Blocked by:** 01 (Send an Inquiry end-to-end)

**Status:** ready-for-agent

- [ ] Honeypot is invisible and unreachable by keyboard for real Visitors
- [ ] Filled honeypot → 200, transport not called
- [ ] 6th Inquiry within an hour from one IP → 429; window shows the XP error box; draft kept
- [ ] Rate limit keys on the forwarded client IP (one trusted hop), not the proxy's IP
- [ ] Tests: honeypot, rate limit, forwarded-IP keying
- [ ] `npm run build` and `npm run lint` pass
