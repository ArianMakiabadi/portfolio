---
paths:
  - "src/components/window/**/*.tsx"
  - "src/programs/**/*Window.tsx"
  - "src/types/window*.ts"
  - "src/types/menuBar.ts"
  - "src/types/infoStrip.ts"
  - "src/index.css"
---

# Window Chrome Extras

`Window` takes optional `menus?: MenuBarMenu[]` (renders `MenuBar` — a classic dropdown menu strip, items are `"action" | "checkable" | "separator"`) and `infoStrip?: InfoStripConfig` (renders `InfoStrip`, a status-bar-style strip below the content with text segments and an optional external link). Both are opt-in per window; see `MinesweeperWindow`/`PinballWindow`/`SolitaireWindow` for usage. `infoStrip` adds `INFO_STRIP_HEIGHT` (20px, matches the CSS `.infostrip` class) on top of the window's `size` — keep that constant and the CSS class in sync if either changes.

Explorer-style chrome is two more opt-in config props, both plain data built in the `<Name>Window` component (types in `src/types/windowHeaderBar.ts` / `windowHeaderTools.ts` / `windowHeaderSearch.ts` / `windowLeftMenu.ts`):

- `headerBar?: WindowHeaderBarConfig` — renders `WindowHeaderBar` = `WindowHeaderTools` (toolbar: `groups` of buttons, each `{icon, label?, onSelect?, disabled?, hasDropdown?, isBack?}`) + `WindowHeaderSearch` (address bar: `{icon, path, onGo?}`).
- `leftMenu?: WindowLeftMenuConfig` — renders `WindowLeftMenu`, the XP task pane: `sections` of `{icon, label, onSelect?, href?}` items; an item with `href` renders as an external link.

Layout order inside `Window` is fixed: `MenuBar` → `WindowHeaderBar` → a row of [`WindowLeftMenu` | children] → `InfoStrip`. Unlike `infoStrip`, the header bar and left menu take their space out of the window's `size` (no extra height added). Buttons/items with no `onSelect`/`href` are decorative XP dressing — that's intentional, not unfinished wiring. `ProjectsWindow` is the reference usage; derive the config from component state each render (e.g. Back's `disabled`, the address `path`) rather than storing it.

`Window` is a `forwardRef` exposing `WindowHandle` (`{ toggleMaximize }`) — maximize is local `Window` state, so a menu item that needs it goes through the ref (see `JsPaintWindow`); minimize is store state, so call `useWindowManager().minimizeWindow(id)` instead.
