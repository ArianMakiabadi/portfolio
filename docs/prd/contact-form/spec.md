# PRD: Contact window + Inquiry backend

Status: needs-triage

Vocabulary follows `GLOSSARY.md` (Inquiry, Visitor, Owner, Contact window).

## 1. Problem & goal

Visitors have no way to reach the Owner from inside the portfolio. The Start menu has a "Contact Me" entry (`src/data/startMenuItems.ts`, id `contact`), but no window is wired behind it, and there is no backend.

**Goal**: a Visitor can compose an Inquiry in a Contact window and send it. A small Express backend validates it and emails it to the Owner, who replies straight from their mail client.

## 2. User stories

- As a Visitor, I open the Contact window from the Start menu, a desktop icon, or the Projects window's "Contact me" link.
- As a Visitor, I fill in my name, email, an optional subject and a message, press Send, and get clear confirmation or a clear error. If something fails, I keep my draft.
- As the Owner, I receive each Inquiry as an email. Hitting Reply answers the Visitor directly.
- As the Owner, I am protected from casual spam without the Visitor having to solve a CAPTCHA.

## 3. Frontend: Contact window

### Look & chrome

- Styled as an Outlook Express "New Message" window inside the existing XP window chrome. Reuse the existing window header, menu bar and toolbar building blocks.
- The menu bar and every toolbar button except **Send** are cosmetic (Cut/Copy/Paste etc. render but do nothing).
- Icon: the existing `contactMeIcon`. It gets a taskbar pellet like every other window. Single instance: opening it again focuses the existing window.

### Openers (all open the same window)

- Start menu entry `contact` (`src/data/startMenuItems.ts`).
- Projects window left-menu link "Contact me" (`src/components/window/ProjectsWindow.tsx`).
- New desktop icon: add `contact` to `DESKTOP_APP_IDS` in `src/data/desktopItems.ts`.

### Fields

| Field   | Required | Constraint               | Notes                                                                             |
| ------- | -------- | ------------------------ | --------------------------------------------------------------------------------- |
| To      | n/a      | read-only                | Display name only (e.g. "Arian"). The Owner's email is never in the bundle.       |
| Name    | yes      | ≤ 200 chars              |                                                                                   |
| Email   | yes      | valid email, ≤ 200 chars | Becomes the Reply-To.                                                             |
| Subject | no       | ≤ 200 chars              |                                                                                   |
| Message | yes      | ≤ 1000 chars             |                                                                                   |
| website | no       | hidden honeypot          | Visually hidden, `tabindex=-1`, `autocomplete=off`. Real Visitors leave it empty. |

- The server is the only validator. The form is `noValidate`, so the browser shows no validation popups. `required`, `type="email"` and `maxlength` stay as attributes (`maxlength` still caps typing for name, email and subject).
- Exception: Message length is also checked in the frontend on submit. Over 1000 characters shows the server's inline error message, and nothing is sent. The textarea has no `maxlength`, so this error can show.
- Validation runs on submit. Errors never show while the Visitor is typing.
- A 400 response's per-field errors render inline only, never as modals, alerts or toasts:
  - Invalid input keeps its white background and XP sizing, and gets a 1px `#CC0000` border.
  - The error message sits ~3px below the field, left-aligned with it, in the pixel font at 11px, normal weight, `#CC0000`.
  - No banners, colored backgrounds, shadows or icons.

### States

- **Sending**: Send is disabled and `useProgressCursor(true)` runs (see `.claude/rules/loading-states.md`).
- **Success (200)**: an XP-style "Message sent" message box appears. On dismiss, the Contact window closes.
- **Validation error (400)**: inline field errors. The draft is kept.
- **Rate limited (429)**: an XP error box saying "Too many messages, try again later". The draft is kept.
- **Server/mail failure (502, 5xx, network)**: an XP error box with a generic failure message. The draft is kept.

## 4. Backend

### Stack & layout

- `server/` directory in this repo with its own `package.json` and `tsconfig.json`. Not an npm workspace.
- TypeScript, Express 5, zod (validation), Nodemailer (SMTP).
- The request/response shape is duplicated in frontend and backend, with no shared package.

### API

`POST /api/inquiries`

Request body (JSON):

```json
{ "name": "…", "email": "…", "subject": "…", "message": "…", "website": "" }
```

| Status | Body                                   | When                                                           |
| ------ | -------------------------------------- | -------------------------------------------------------------- |
| 200    | `{ "ok": true }`                       | Email sent, **or** the honeypot was filled (silently dropped). |
| 400    | `{ "errors": { "<field>": "<msg>" } }` | zod validation failed.                                         |
| 413    | `{ "error": "payload_too_large" }`     | Request body over 16kb.                                        |
| 429    | `{ "error": "rate_limited" }`          | The IP exceeded the rate limit.                                |
| 502    | `{ "error": "send_failed" }`           | The SMTP transport rejected or failed.                         |

`GET /api/health` returns `200 { "ok": true }`, for post-deploy checks.

- Same-origin only: no CORS middleware. The frontend and API share one domain behind Nginx.
- Body size limit sized for the max payload (e.g. `express.json({ limit: "16kb" })`).

### Spam protection

- **Honeypot**: if `website` is non-empty, respond 200 and send nothing.
- **Rate limit**: 5 Inquiries per hour per IP, kept in memory (single process).
- `app.set("trust proxy", 1)` so the rate limit sees the Visitor's real IP behind Nginx.
- CAPTCHA (e.g. Cloudflare Turnstile) is out of scope. Revisit if spam gets through.

### Email to the Owner

- **From**: `INQUIRY_FROM` (a sending address on the Owner's domain)
- **To**: `INQUIRY_TO` (the Owner's inbox)
- **Reply-To**: the Visitor's email
- **Subject**: `[Portfolio] <subject>`, or `[Portfolio] New inquiry` when there is no subject
- **Body** (plain text): name, email, message, received-at timestamp (ISO)
- Transport: generic SMTP via env vars. The provider is a transactional email service (e.g. Resend or Postmark) on the Owner's own domain, with SPF/DKIM configured.

### Configuration (env)

| Var            | Purpose                                            |
| -------------- | -------------------------------------------------- |
| `PORT`         | Listen port (default `3001`), bound to `127.0.0.1` |
| `SMTP_HOST`    | SMTP host                                          |
| `SMTP_PORT`    | SMTP port                                          |
| `SMTP_USER`    | SMTP username                                      |
| `SMTP_PASS`    | SMTP password / API key                            |
| `INQUIRY_FROM` | From address                                       |
| `INQUIRY_TO`   | Owner's inbox                                      |

A committed `server/.env.example` documents all of them. The real `.env` is gitignored.

### Persistence & logging

- No database. Inquiries are not stored after the email is sent.
- Logs go to stdout (journald on the VPS): timestamp, hashed IP, outcome (`sent` / `honeypot` / `invalid` / `rate_limited` / `send_failed`). Never log the message body or the Visitor's email.

## 5. Local development

- Vite dev server proxies `/api` → `http://localhost:3001` (`vite.config.ts` `server.proxy`).
- When the SMTP env vars are missing, the server uses a console transport: it prints the would-be email instead of sending it.
- A root script `npm run dev:all` runs the Vite dev server and the backend together.

## 6. Deployment (Ubuntu VPS, manual)

- **Nginx** serves the built frontend `dist/` and proxies `/api/*` → `http://127.0.0.1:3001`.
- **HTTPS** through Let's Encrypt (certbot, Nginx plugin).
- **systemd** unit runs the built backend (`node dist/index.js`) with `EnvironmentFile=` pointing at the server `.env`, `Restart=on-failure`, as a non-root user.
- Deliverables in repo: a sample Nginx site config, the systemd unit file, `server/.env.example`, and a `docs/` deploy guide (build → copy → restart → check `/api/health`).
- CI/CD and automated deploys are out of scope.

## 7. Testing

- Backend: Vitest + Supertest against the Express app, with a stub mail transport. Cases:
  - valid Inquiry → 200, transport called once with the correct From/To/Reply-To/Subject
  - each invalid field → 400 with the matching field error
  - honeypot filled → 200, transport not called
  - 6th request within an hour from the same IP → 429
  - transport throws → 502
  - `GET /api/health` → 200
- Frontend: manual testing (the repo has no frontend test setup). `npm run build` and `npm run lint` must pass.

## 8. Out of scope

- Storing Inquiries (DB, files) or any admin UI
- Auto-reply email to the Visitor
- CAPTCHA
- CI/CD
- Shared types package between frontend and backend

## 9. Acceptance criteria

- [ ] The Contact window opens from the Start menu, the desktop icon and the Projects window link. It is single-instance and has a taskbar pellet.
- [ ] The window looks like an Outlook Express "New Message". Only Send is functional.
- [ ] Required fields and lengths are enforced client-side (HTML) and server-side (zod).
- [ ] Sending shows the progress cursor and disables Send.
- [ ] Success shows an XP "Message sent" box, then closes the window.
- [ ] 400 shows inline field errors. 429 and 502 show XP error boxes. The draft is kept in all error cases.
- [ ] The Owner receives an email with the correct subject format, and Reply-To is the Visitor's email.
- [ ] A filled honeypot returns 200 and sends nothing.
- [ ] More than 5 Inquiries per hour per IP returns 429, with the real client IP taken from behind Nginx.
- [ ] The Owner's email address appears nowhere in the frontend bundle.
- [ ] Logs contain no message bodies or Visitor emails.
- [ ] `npm run dev:all` works locally without SMTP credentials (console transport).
- [ ] Backend tests pass. `npm run build` and `npm run lint` pass.
- [ ] Nginx config, systemd unit, `.env.example` and the deploy guide are committed. `/api/health` returns 200 on the VPS.
