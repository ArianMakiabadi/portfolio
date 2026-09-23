---
paths:
  - "src/data/**/*.ts"
  - "src/components/bootup/bootupAssets.ts"
  - "src/programs/minesweeper/minesweeperAssets.ts"
---

# Shared Asset Re-export Pattern

When the same asset paths are needed by more than one consumer (e.g. rendering + preloading), extract a shared file that imports each asset once and re-exports both the individual bindings and a flat `string[]` — see `src/data/startMenuIcons.ts` (`START_MENU_ICON_URLS`), consumed by both `startMenuItems.ts` and `src/components/bootup/bootupAssets.ts` — rather than duplicating the import list per consumer.
