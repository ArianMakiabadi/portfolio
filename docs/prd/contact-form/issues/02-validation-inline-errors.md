# 02: Validation with inline field errors

**What to build:** A Visitor who submits an incomplete or invalid Inquiry is told exactly which field is wrong, right next to that field, and keeps everything they typed. The server is the only validator: the form validates on submit, and every error shows inline.

Rules: Name required ≤ 200, Email required and valid ≤ 200, Subject optional ≤ 200, Message required ≤ 1000. Request body capped at a small size (~16kb).

- Contact window form is `noValidate`: no native validation popups. `required`, `type="email"` and `maxlength` stay as attributes (`maxlength` still caps typing for name/email/subject).
- Exception: Message length is also checked in the frontend on submit. Over 1000 characters shows the same inline error as the server's, and nothing is sent. The textarea has no `maxlength`, so the error can show. The server's 1000 limit stays as the backstop.
- Inline errors only: no modals, alerts or toasts for validation. Errors appear after submit, never while typing.
- Invalid input keeps its white background and XP sizing, with a 1px `#CC0000` border. The error message sits ~3px below the field, left-aligned with it, in the pixel font at 11px, normal weight, `#CC0000`. No banners, backgrounds, shadows or icons.
- Server validates with zod; failure → `400 { errors: { <field>: <msg> } }`.
- Window renders each field error inline; draft is kept.
- Log outcome `invalid`.

**Blocked by:** 01 (Send an Inquiry end-to-end)

**Status:** ready-for-agent

- [x] Each rule above is enforced server-side and returns the matching field error
- [x] Inline errors render next to the right field; fixing and resending clears them
- [x] Draft survives a 400
- [x] Oversized body is rejected
- [x] Tests: one 400 case per invalid field (missing, too long, bad email)
- [x] Logs `invalid` without personal data
- [x] `npm run build` and `npm run lint` pass
