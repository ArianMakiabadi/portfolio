---
paths:
  - "src/context/**/*.ts"
  - "src/context/**/*.tsx"
  - "src/components/window/Window.tsx"
  - "src/components/bootup/Desktop.tsx"
  - "src/components/taskbar/Taskbar.tsx"
---

# Window Manager Store

State lives outside React entirely, in a plain pub/sub store (`src/context/windowStore.ts`, `createWindowStore()`) — not `useState`/Context value objects — so that focusing/minimizing one window doesn't re-render every other open window. Split across four files so Fast Refresh stays happy: `windowStore.ts` (the store factory + types), `windowManagerContext.ts` (a `createContext` whose value is the store instance itself, never recreated), `WindowManagerProvider.tsx` (creates one store via `useState(createWindowStore)` for the app's lifetime and owns the document-level `mousedown` listener), `useWindowManager.ts` (the hooks). Only import hooks from `useWindowManager.ts` in consumers, never the context or store directly.

`useWindowManager()` returns the stable action callbacks (`registerWindow`, `unregisterWindow`, `focusWindow`, `minimizeWindow`, `registerWindowElement`) — memoized off the store instance, safe to destructure without causing re-renders. Reactive state is read through separate `useSyncExternalStore`-backed hooks scoped to exactly what a consumer needs, so a store mutation only re-renders the components whose selected value actually changed:

- `useIsWindowActive(id)` / `useIsWindowMinimized(id)` / `useWindowZIndex(id)` — per-window primitives, used by `Window.tsx`
- `useWindowList()` — the `{id, title, iconSrc}[]` the taskbar renders from; the store only rebuilds this array on register/unregister, so it doesn't change on focus/minimize/drag
- `useActiveWindowId()` — used by both `Window.tsx` (to compute `isActive`) and `Taskbar.tsx` (to highlight the active pellet)

Internally the store also tracks a z-index map (focusing a window bumps it to a new highest z-index) and an `elements` map of registered DOM nodes — a document-level `mousedown` listener (in the provider) calls the store's `blurActive()` when the click lands outside every registered window element.

`Window.tsx` is the only component that talks to the store's mutators directly. On mount it calls `registerWindow(id, meta)` + `focusWindow(id)`, and unregisters on unmount — deliberately a mount-only effect with an `exhaustive-deps` disable. It owns its own position/size/maximize/closed state locally; the store owns focus, minimize, and stacking. Minimize hides via `display: none` (state preserved), close unmounts content via a local `isClosed` flag.

Windows are single-instance: `id` is a hardcoded literal (`"minesweeper"`, `"pinball"`, `"solitaire"`) and `Desktop.tsx` tracks open/closed per id in a plain `Record<string, boolean>` state (`openApps`), not a list — opening the same app twice just re-shows the one window.
