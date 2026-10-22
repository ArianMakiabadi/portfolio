---
paths:
  - "server/**"
  - "src/components/window/ContactWindow.tsx"
  - "src/components/contact/**"
  - "src/components/shared/MessageBox.tsx"
  - "src/hooks/useContactForm.ts"
  - "src/utils/sendInquiry.ts"
  - "src/types/inquiry.ts"
---

# Contact Window & Inquiry Backend

Spec + tickets: `docs/prd/contact-form/`. Vocabulary: `GLOSSARY.md` (Inquiry, Visitor, Owner).

Frontend follows the native-program split: `useContactForm` (`{state, actions}`) owns fields + sending state, `ContactWindow` wires it, `ContactForm` is presentational. `useProgressCursor(isSending)` while posting. `ContactWindow` shows the Owner's display name only — the Owner's email must never be in the frontend bundle. `MessageBox` (`src/components/shared/`) is the reusable modal XP box (`title`, `icon`, `message`, `onOk`), portaled to `<body>`; use it for future error boxes too. Both use `.xp-text` (`index.css`): the custom `pixel` font (`src/assets/fonts/pixel-*.woff`, theme token `--font-pixel`) at 11px — keep pixel-font sizes at multiples of 11px or it blurs.

`server/` is its own package (ESM, NodeNext — relative imports need `.js`), not a workspace; `Inquiry` is duplicated in `src/types/inquiry.ts` on purpose. `createApp({transport, mail, log})` (`server/src/app.ts`) is the test seam: tests inject a stub `MailTransport` and capture log lines. Delivery always goes through `MailTransport` (`server/src/mail/transport.ts`); `index.ts` currently wires the console transport. Outcome logs go through `formatOutcome` (`server/src/log.ts`): time, HMAC-hashed IP (key `IP_HASH_SECRET`, else random per process), outcome — never message bodies or Visitor emails. Vitest is 4.x because local Node is 20.
