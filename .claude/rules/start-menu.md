---
paths:
  - "src/data/startMenuItems.ts"
  - "src/data/desktopItems.ts"
  - "src/components/bootup/desktop/DesktopIcons.tsx"
  - "src/components/taskbar/startmenu/**/*.tsx"
  - "src/components/taskbar/Taskbar.tsx"
  - "src/components/bootup/desktop/Desktop.tsx"
---

# Start Menu & Desktop Icons

Items are data, not markup: `src/data/startMenuItems.ts` exports `startMenuApps` (each with an `id`) and `startMenuLinks` (external hrefs). `StartMenu` calls `onSelectApp(id)` → `Taskbar`'s `onSelectApp` prop → `Desktop.openApp(id)`, which flips `openApps[id]` and conditionally mounts the matching `<Window>`. Adding a new app means: add the entry to `startMenuApps`, build a `<Name>Window>` component, and mount it conditionally in `Desktop.tsx`. Entries without a mounted window (`cv`, `notepad`, `contact`) are currently no-ops when clicked.

Desktop icons are a second launcher over the same data: `src/data/desktopItems.ts` derives `desktopItems` from `startMenuApps` by id (`DESKTOP_APP_IDS`, in display order) — to put an app on the desktop, add its id there, never duplicate title/icon. `DesktopIcons` (`src/components/bootup/desktop/DesktopIcons.tsx`) renders them with the shared `IconItem`/`useIconSelection` pair (see icon selection rule) and opens on double-click through the same `Desktop.openApp(id)`. It's an `absolute inset-0` layer rendered _before_ (so underneath) `WindowManagerProvider`'s windows and taskbar, and sits outside the provider — it must not use window-manager hooks.

The footer's Log Off / Shut Down buttons go `StartMenu` → `Taskbar` (`onLogOff` / `onShutDown`, closes the menu first) → `Desktop`, which opens `PowerDialog` in the matching mode — see the boot flow rule for what the dialog does.
