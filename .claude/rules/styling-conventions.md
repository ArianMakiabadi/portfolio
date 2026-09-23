---
paths:
  - "src/**/*.tsx"
  - "src/index.css"
---

# Styling Conventions

- Tailwind v4 with no config file — theme tokens (`@theme`) live in `src/index.css`, as does XP chrome shared across components (title bar gradients, window control buttons, taskbar pellets, start menu panels: hand-written CSS gradients and `::before`/`::after` shapes, referenced from JSX by class name). Strictly: only styles reused by more than one component, or genuinely global/theme-level rules, belong in `index.css` as a named class. Anything specific to a single component must be written inline as Tailwind utility classes in that component's JSX, never added to `index.css` — including new XP chrome. Existing components haven't all been migrated to this rule yet (only `WindowHeaderSearch` has, so far), so don't assume `index.css` is already free of single-component styles — but all new or changed components should follow this rule.
- Custom `.cur` cursors: the default arrow is set globally on `html, body, #root`; add the `pointer` class (not `cursor-pointer`) to anything clickable, and `progress` for waiting states — for an app-wide wait cursor during a window's loading phase, use the `useProgressCursor` hook (`src/hooks/useProgressCursor.ts`) rather than toggling the class by hand.
