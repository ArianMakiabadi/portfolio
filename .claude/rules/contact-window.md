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

`server/` is its own package (ESM, NodeNext — relative imports need `.js`), not a workspace; `Inquiry` is duplicated in `src/types/inquiry.ts` on purpose. `createApp({transport, mail, log})` (`server/src/app.ts`) is the test seam: tests inject a stub `MailTransport` and capture log lines. Delivery always goes through `MailTransport` (`server/src/mail/transport.ts`); `index.ts` currently wires the console transport. Validation: zod schema + `validateInquiry` in `server/src/inquiry.ts` (trims, first message per field) → `400 {errors: {<field>: <msg>}}`, logged `invalid`; bodies over 16kb → `413 {error: "payload_too_large"}` via `jsonBodyErrors` in `app.ts`. Frontend: `sendInquiry` returns `{ok:false, fieldErrors}` on 400 and throws on other failures; `useContactForm` keeps `fieldErrors` (replaced per response, cleared on success), `ContactForm` renders them inline under each field. Error UI is inline only: the form is `noValidate` (no native popups, no alerts/toasts/modals for validation; `required`/`type`/`maxLength` stay as attributes), errors appear only after submit, invalid inputs keep the white bg + get a 1px `#cc0000` border via `aria-[invalid=true]:`, messages are `#cc0000` `.xp-text` 3px below the field, left-aligned with it. Field limits: name/email/subject 200 (mirrored as `maxLength`), message 1000. The message limit is also checked client-side in `useContactForm.submit` (same message text as the server, no request sent); the textarea deliberately has no `maxLength`, or that error could never show, and `InquiryFieldErrors` is duplicated like `Inquiry`. Outcome logs go through `formatOutcome` (`server/src/log.ts`): time, HMAC-hashed IP (key `IP_HASH_SECRET`, else random per process), outcome — never message bodies or Visitor emails. Vitest is 4.x because local Node is 20.
