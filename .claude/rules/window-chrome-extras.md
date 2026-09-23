---
paths:
  - "src/components/window/**/*.tsx"
  - "src/programs/**/*Window.tsx"
  - "src/index.css"
---

# Window Chrome Extras

`Window` takes optional `menus?: MenuBarMenu[]` (renders `MenuBar` — a classic dropdown menu strip, items are `"action" | "checkable" | "separator"`) and `infoStrip?: InfoStripConfig` (renders `InfoStrip`, a status-bar-style strip below the content with text segments and an optional external link). Both are opt-in per window; see `MinesweeperWindow`/`PinballWindow`/`SolitaireWindow` for usage. `infoStrip` adds `INFO_STRIP_HEIGHT` (20px, matches the CSS `.infostrip` class) on top of the window's `size` — keep that constant and the CSS class in sync if either changes.
