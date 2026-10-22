# 01: Send an Inquiry end-to-end (tracer bullet)

**What to build:** A Visitor opens the Contact window from the Start menu's "Contact Me" entry, fills in Name, Email, optional Subject and Message, and presses Send. The Inquiry travels to a new Express backend, which "delivers" it by printing the would-be email to the console (no SMTP yet). The Visitor sees an XP-style "Message sent" message box; dismissing it closes the Contact window. This proves the whole path: window → API → delivery → feedback.

Scope:

- Basic Contact window: read-only To (Owner's display name only, never the email address), Name, Email, Subject, Message, Send. Single instance, taskbar pellet, existing contact icon. Visual polish comes later (ticket 05).
- While sending: Send disabled and the app-wide progress cursor shown (existing progress-cursor hook).
- A reusable XP message box component (title, icon, text, OK), used here for success and later for errors.
- New `server/` project (own package.json, TypeScript, Express 5) with `POST /api/inquiries` → `200 { ok: true }` and `GET /api/health` → `200 { ok: true }`. Listens on 127.0.0.1, default port 3001.
- Console mail transport behind a small transport interface, so later tickets can swap in SMTP or a test stub.
- Outcome logging to stdout: timestamp, hashed IP, outcome (`sent`). Never the message body or Visitor email.
- Local dev: Vite proxies `/api` to the backend; a root `npm run dev:all` runs both.
- Backend test harness: Vitest + Supertest against the app with a stub transport.

**Blocked by:** None (can start immediately)

**Status:** done

- [x] Start menu "Contact Me" opens the Contact window; opening it again focuses the existing one; it has a taskbar pellet
- [x] Owner's email address does not appear anywhere in the frontend bundle
- [x] Send posts the Inquiry; Send is disabled and the progress cursor shows until the response arrives
- [x] On 200, an XP "Message sent" box appears; OK closes the box and the Contact window
- [x] Server prints the would-be email to the console
- [x] `GET /api/health` returns 200
- [x] `npm run dev:all` starts frontend and backend; `/api` works through the Vite proxy
- [x] Tests: valid Inquiry → 200 and transport called once; health → 200
- [x] Log line per Inquiry contains timestamp, hashed IP, `sent`, and nothing else personal
- [x] `npm run build` and `npm run lint` pass

## Comments

- Implemented on `feat/contact-inquiry`. Vitest pinned to 4.x: vitest 5 requires Node ≥22, local Node is 20.
- Re-selecting an open app from the Start menu didn't focus it (pre-existing, all apps). Fixed in `Taskbar.handleSelectApp` + `focusWindow` ignoring unregistered ids. Desktop icons still don't refocus (they live outside the window-manager provider).
- Send failures currently just re-enable Send and keep the draft (logged to console); error boxes arrive with tickets 02/03.
