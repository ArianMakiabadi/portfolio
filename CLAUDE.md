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

A personal portfolio built as a recreation of the Windows XP desktop in React 19 + TypeScript + Vite + Tailwind v4. Portfolio content (projects, CV, notepad, minesweeper, etc.) is meant to open as draggable XP windows launched from the Start menu.

## Architecture

**Boot flow.** `App.tsx` renders either `BootSequence` (the full black screen → startup logo → welcome → login → desktop chain, driven by a `Stage` union and `await wait(ms)` in a single effect) or `Desktop` directly. During development it's normal to see `<BootSequence />` commented out in `App.tsx` so the desktop renders immediately — restore it before committing.

**Window management.** The system is a context (`src/context/`), split across three files so Fast Refresh stays happy: `windowManagerContext.ts` (the `createContext` + types), `WindowManagerProvider.tsx` (the state), `useWindowManager.ts` (the throwing hook). Only import the hook from consumers.

State lives in the provider, not in the `Window` components:

- `windows: Record<id, {title, iconSrc, isMinimized}>` — the registry the taskbar renders from
- `zIndexes` + `highestZIndexRef` — focusing a window bumps it to a new highest z-index
- `elementsRef: Map<id, HTMLElement>` — a document-level `mousedown` listener clears `activeWindowId` when the click lands outside every registered window element

`Window.tsx` is the only component that talks to the registry directly. On mount it calls `registerWindow(id, meta)` + `focusWindow(id)`, and unregisters on unmount — deliberately a mount-only effect with an `exhaustive-deps` disable. It owns its own position/size/maximize/closed state locally; the provider owns focus, minimize, and stacking. Minimize hides via `display: none` (state preserved), close unmounts content via a local `isClosed` flag.

**Taskbar coupling.** `Taskbar.tsx` measures its own height with a `ResizeObserver` and writes it to the `--taskbar-height` CSS variable on `<html>`. `Window.tsx` reads that variable back (`getTaskbarHeight()`, fallback 30) to clamp dragging and resizing above the taskbar, and uses it in the maximized height calculation. Don't hardcode the taskbar height on either side.

**Start menu.** Items are data, not markup: `src/data/startMenuItems.ts` exports `startMenuApps` (each with an `id` like `"minesweeper"`) and `startMenuLinks` (external hrefs). `StartMenu` calls `onSelectApp(id)`; currently `Taskbar` only closes the menu on select — wiring an id to an actual `<Window>` is the open work.

## Conventions

- Tailwind v4 with no config file — theme tokens (`@theme`), component classes (`@layer components`), and custom utilities (`@utility`) all live in `src/index.css`. The XP chrome (title bar gradients, window control buttons, taskbar pellets, start menu panels) is hand-written CSS gradients and `::before`/`::after` shapes there, referenced from JSX by class name. Add new XP chrome as a class in `index.css` rather than inline Tailwind soup.
- Custom `.cur` cursors: the default arrow is set globally on `html, body, #root`; add the `pointer` class (not `cursor-pointer`) to anything clickable, and `progress` for waiting states.
- Assets are imported as ES modules (`import icon from "../../assets/..."`) so Vite fingerprints them; images are `.webp`, sounds are `.mp3` played through `utils/audio.ts`'s `playSound`.
- Components are function declarations with a `export default` at the bottom, props typed via a local `type XProps = {...}`. Shared types go in `src/types/`.
- Prefer relative imports — no path aliases are configured.
