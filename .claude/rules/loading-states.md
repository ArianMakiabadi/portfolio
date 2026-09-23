---
paths:
  - "src/hooks/useProgressCursor.ts"
  - "src/utils/preloadImages.ts"
  - "src/programs/pinball/PinballWindow.tsx"
  - "src/programs/pinball/Pinball.tsx"
  - "src/programs/solitaire/SolitaireWindow.tsx"
  - "src/programs/solitaire/Solitaire.tsx"
  - "src/programs/minesweeper/MinesweeperWindow.tsx"
  - "src/programs/minesweeper/minesweeperAssets.ts"
  - "src/components/bootup/BootSequence.tsx"
  - "src/components/bootup/bootupAssets.ts"
---

# Loading States

Any `<Name>Window` with a `loaded` boolean (waiting on an iframe/game to report ready, or on assets to prefetch) calls `useProgressCursor(!loaded)` (`src/hooks/useProgressCursor.ts`) to toggle the `progress` class on `#root`, switching the whole app's cursor to the OS wait cursor while that window is loading. Used by `PinballWindow`, `SolitaireWindow`, `MinesweeperWindow` — apply it to any new window with a loading phase rather than hand-rolling the class toggle again. This is separate from (and stacks with) a local `.progress` overlay div scoped to the window's own content, like `Pinball.tsx`/`Solitaire.tsx`'s "Loading..." overlays. `MinesweeperWindow` goes one step further: it has no iframe to show a loading overlay in, so it prefetches its sprite sheet via `preloadImages()` (`src/utils/preloadImages.ts`) against the asset list in `minesweeperAssets.ts`, and returns `null` (rendering no `<Window>` at all) until `loaded` flips true — the window only appears once fully ready, instead of popping in and progressively painting sprites. `BootSequence` uses `preloadImages()` differently — fire-and-forget, no `loaded` state or gating: a plain `useEffect` call against `bootupAssets.ts`'s `BOOT_PRELOAD_ASSET_URLS` (boot images, the taskbar start button, the wait cursor, all Start Menu icons) just warms the browser cache ahead of need. Use the MinesweeperWindow pattern when a window must block on assets; use this fire-and-forget pattern when you only want something cached before it's needed later, without delaying anything currently rendering.
