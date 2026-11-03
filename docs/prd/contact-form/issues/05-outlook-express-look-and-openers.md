# 05: Outlook Express look + all openers

**What to build:** The Contact window looks like an Outlook Express "New Message" window, and a Visitor can open it from anywhere they would expect: the Start menu, a desktop icon, or the Projects window's "Contact me" link.

- Outlook Express "New Message" styling inside the existing XP window chrome: menu bar (File, Edit, View, Insert, Format, Tools, Message, Help) and toolbar (Send, Cut, Copy, Paste, Undo, …) built from the existing window building blocks.
- Only Send is functional; every other menu and toolbar item is cosmetic.
- New desktop icon for the Contact window.
- The Projects window's "Contact me" link opens the Contact window instead of linking nowhere.
- All three openers open the same single instance (focus it if already open).

**Blocked by:** 01 (Send an Inquiry end-to-end)

**Status:** ready-for-agent

- [ ] Window reads clearly as an Outlook Express "New Message"
- [ ] Toolbar Send sends the Inquiry; other items do nothing and throw no errors
- [ ] Desktop icon opens the Contact window (selection/double-click behave like other desktop icons)
- [ ] Projects window "Contact me" opens the Contact window
- [ ] Opening from any opener while it's open focuses the existing window
- [ ] `npm run build` and `npm run lint` pass
