---
paths:
  - "src/data/startMenuItems.ts"
  - "src/components/taskbar/startmenu/**/*.tsx"
  - "src/components/taskbar/Taskbar.tsx"
  - "src/components/bootup/Desktop.tsx"
---

# Start Menu

Items are data, not markup: `src/data/startMenuItems.ts` exports `startMenuApps` (each with an `id`) and `startMenuLinks` (external hrefs). `StartMenu` calls `onSelectApp(id)` → `Taskbar`'s `onSelectApp` prop → `Desktop.openApp(id)`, which flips `openApps[id]` and conditionally mounts the matching `<Window>`. Adding a new app means: add the entry to `startMenuApps`, build a `<Name>Window>` component, and mount it conditionally in `Desktop.tsx`.
