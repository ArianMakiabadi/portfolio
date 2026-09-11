# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Vite dev server
npm run build    # tsc -b (typecheck, project references) then vite build
npm run lint     # eslint .
npm run preview  # serve the production build
```

There is no test setup in this repo. `npm run build` is the typecheck gate — `tsconfig.app.json` enables `noUnusedLocals`/`noUnusedParameters`, so unused imports break the build, not just lint.

The README is the stock Vite template README and describes nothing about this project.

## Response style

be extremly concise, sacrifice grammer for the sake of consision.

## What this is

A personal portfolio built as a recreation of the Windows XP desktop in React 19 + TypeScript + Vite + Tailwind v4. Portfolio content opens as draggable XP windows launched from the Start menu. Wired apps so far: Minesweeper (native), Solitaire and 3D Pinball (embedded games, see below). `projects`, `cv`, `notepad`, `paint`, `contact` exist as Start menu entries in `startMenuItems.ts` but have no `<Window>` behind them yet — wiring those up is the open work.

## Architecture

**Boot flow.** `App.tsx` renders either `BootSequence` (the full black screen → startup logo → welcome → login → desktop chain, driven by a `Stage` union and `await wait(ms)` in a single effect) or `Desktop` directly. During development it's normal to toggle which one is commented out in `App.tsx` so the desktop renders immediately, skipping the boot animation — restore `<BootSequence />` before committing.

**Window management.** The system is a context (`src/context/`), split across three files so Fast Refresh stays happy: `windowManagerContext.ts` (the `createContext` + types), `WindowManagerProvider.tsx` (the state), `useWindowManager.ts` (the throwing hook). Only import the hook from consumers.

State lives in the provider, not in the `Window` components:

- `windows: Record<id, {title, iconSrc, isMinimized}>` — the registry the taskbar renders from
- `zIndexes` + `highestZIndexRef` — focusing a window bumps it to a new highest z-index
- `elementsRef: Map<id, HTMLElement>` — a document-level `mousedown` listener clears `activeWindowId` when the click lands outside every registered window element

`Window.tsx` is the only component that talks to the registry directly. On mount it calls `registerWindow(id, meta)` + `focusWindow(id)`, and unregisters on unmount — deliberately a mount-only effect with an `exhaustive-deps` disable. It owns its own position/size/maximize/closed state locally; the provider owns focus, minimize, and stacking. Minimize hides via `display: none` (state preserved), close unmounts content via a local `isClosed` flag.

Windows are single-instance: `id` is a hardcoded literal (`"minesweeper"`, `"pinball"`, `"solitaire"`) and `Desktop.tsx` tracks open/closed per id in a plain `Record<string, boolean>` state (`openApps`), not a list — opening the same app twice just re-shows the one window.

**Window chrome extras.** `Window` takes optional `menus?: MenuBarMenu[]` (renders `MenuBar` — a classic dropdown menu strip, items are `"action" | "checkable" | "separator"`) and `infoStrip?: InfoStripConfig` (renders `InfoStrip`, a status-bar-style strip below the content with text segments and an optional external link). Both are opt-in per window; see `MinesweeperWindow`/`PinballWindow`/`SolitaireWindow` for usage. `infoStrip` adds `INFO_STRIP_HEIGHT` (20px, matches the CSS `.infostrip` class) on top of the window's `size` — keep that constant and the CSS class in sync if either changes.

**Taskbar coupling.** `Taskbar.tsx` measures its own height with a `ResizeObserver` and writes it to the `--taskbar-height` CSS variable on `<html>`. `Window.tsx` reads that variable back (`getTaskbarHeight()`, fallback 30) to clamp dragging and resizing above the taskbar, and uses it in the maximized height calculation. Don't hardcode the taskbar height on either side.

**Start menu.** Items are data, not markup: `src/data/startMenuItems.ts` exports `startMenuApps` (each with an `id`) and `startMenuLinks` (external hrefs). `StartMenu` calls `onSelectApp(id)` → `Taskbar`'s `onSelectApp` prop → `Desktop.openApp(id)`, which flips `openApps[id]` and conditionally mounts the matching `<Window>`. Adding a new app means: add the entry to `startMenuApps`, build a `<Name>Window>` component, and mount it conditionally in `Desktop.tsx`.

**Embedded games (iframe + bridge).** Solitaire and Pinball are not native React — they're standalone HTML/JS(/WASM) bundles that live in `public/programs/<name>/` (untouched by the TS build) and load into a same-origin `<iframe src="/programs/<name>/...">`. The game script attaches a `window.<name>Bridge` object inside the iframe (e.g. `window.solitaireBridge`, `window.pinballBridge`); the `<Name>Window` component reads `iframeRef.current.contentWindow.<name>Bridge` on demand to wire the XP `MenuBar` (new game, exit, etc.) to the embedded game. There's no live subscription — the bridge is polled/called imperatively per menu click, not stored in state. `PinballWindow` additionally deals with WASM audio-autoplay gesture rules (`mute_game_audio`/`unmute_game_audio`/`resume_game_audio` on the frame window, called from a `game-loaded` event handler deferred with `queueMicrotask` because the game wires those globals up asynchronously after dispatching the event) and focuses the game's canvas manually so keyboard controls work immediately. When adding another embedded game, follow this same pattern rather than trying to port the game to React.

**Native programs (e.g. Minesweeper).** State lives in a `use<Name>` hook under `src/hooks/`, returning `{state, actions}`; the `<Name>Window` component only wires `actions` into the `MenuBar` and passes the whole hook result down to a presentational `<Name>` component. Keep game logic out of the `Window`-wrapping component.

## Conventions

- Tailwind v4 with no config file — theme tokens (`@theme`), component classes (`@layer components`), and custom utilities (`@utility`) all live in `src/index.css`. The XP chrome (title bar gradients, window control buttons, taskbar pellets, start menu panels) is hand-written CSS gradients and `::before`/`::after` shapes there, referenced from JSX by class name. Add new XP chrome as a class in `index.css` rather than inline Tailwind soup.
- Custom `.cur` cursors: the default arrow is set globally on `html, body, #root`; add the `pointer` class (not `cursor-pointer`) to anything clickable, and `progress` for waiting states.
- Assets are imported as ES modules (`import icon from "../../assets/..."`) so Vite fingerprints them; images are `.webp` (some third-party game icons are `.png`), sounds are `.mp3` played through `utils/audio.ts`'s `playSound`. Exception: embedded-game assets in `public/programs/` are plain static files referenced by URL string, not imported — they're served as-is, not bundled.
- Components are function declarations with a `export default` at the bottom, props typed via a local `type XProps = {...}`. Shared types go in `src/types/`.
- Prefer relative imports — no path aliases are configured.
- `references/` (gitignored, also excluded from eslint) holds local reference checkouts — e.g. a windows98.js-style desktop clone and a standalone minesweeper clone — kept for behavior/UI reference only. It's not part of the app; don't import from it or treat it as source of truth for this repo's conventions.
