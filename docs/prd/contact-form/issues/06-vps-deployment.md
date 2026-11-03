# 06: VPS deployment

**What to build:** The portfolio and its backend run on the Owner's Ubuntu VPS over HTTPS, and a real Inquiry sent from the live site lands in the Owner's inbox. Deployment is manual and documented; CI/CD is out of scope.

- Nginx site config: serve the built frontend, proxy `/api/*` to the backend on 127.0.0.1:3001, pass forwarded-IP headers.
- HTTPS via Let's Encrypt (certbot, Nginx plugin).
- systemd unit: runs the built backend as a non-root user, reads its env file, restarts on failure, logs to journald.
- Deploy guide in `docs/`: build both, copy to the VPS, install/restart the service, reload Nginx, check `/api/health`. Covers SPF/DKIM setup for the sending domain.
- Commit the sample Nginx config and systemd unit.

**Blocked by:** 03 (Telegram delivery to the Owner), 04 (Spam protection)

**Status:** ready-for-human

- [ ] Sample Nginx config, systemd unit and deploy guide are committed
- [ ] Site loads over HTTPS on the Owner's domain
- [ ] `https://<domain>/api/health` returns 200
- [ ] A real Inquiry from the live site reaches the Owner's inbox, not spam; Reply goes to the Visitor
- [ ] Rate limit sees real client IPs in production (verified in logs: distinct hashed IPs)
- [ ] journald shows outcome logs with no message bodies or Visitor emails
