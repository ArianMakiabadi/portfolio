# Performance & Readability Improvements

Audit of the codebase (React 19 + TypeScript + Vite + Tailwind v4 XP-desktop portfolio) for performance and readability/maintainability issues. Each item below is independent — pick one and implement it without needing the rest. Line numbers are a snapshot as of this writing and may have drifted; the description is precise enough to relocate the code if so.

**How to verify a change**: there is no test suite in this repo. Run `npm run build` (the typecheck gate — `tsconfig.app.json` enables `noUnusedLocals`/`noUnusedParameters`, so unused imports from a refactor break the build) and `npm run lint`, then manually exercise the app in the browser: open multiple windows, drag/resize them, hover the Minesweeper board (ideally at Expert difficulty), open each embedded game (Solitaire, Pinball), and — for any accessibility item — try keyboard-only navigation.

Two items below (R7, R8) describe things that are already-known, intentional open work per `CLAUDE.md`, not bugs — noted inline.

---

## Performance findings

### P1. ~~Window-manager context: new value object every render, single coarse context~~ — DONE

Originally: the provider's `<WindowManagerContext.Provider value={{...}}>` passed a brand-new object literal every render, and that one context bundled unrelated state (`activeWindowId`, `openWindows`, z-index data) together, so every consumer (every open `Window`, plus `Taskbar`) re-rendered whenever *any* piece changed — e.g. focusing one window re-rendered all other open windows and the taskbar.

**Shipped fix** (went further than a `useMemo`/context-split patch): reactive state moved out of React state entirely into a plain pub/sub store (`src/context/windowStore.ts`, `createWindowStore()`), handed through context as a stable reference that never changes. Consumers read it via per-slice `useSyncExternalStore` hooks in `src/context/useWindowManager.ts` (`useIsWindowActive(id)`, `useIsWindowMinimized(id)`, `useWindowZIndex(id)`, `useWindowList()`, `useActiveWindowId()`), so a store mutation only re-renders the components whose specific selected value actually changed — focusing one window no longer re-renders others. See `CLAUDE.md`'s "Window management" section for the full design.

### P2. `useMinesweeper` clones the entire board on every mouse-hover
**File**: `src/hooks/useMinesweeper.ts:166-181` (the `OPENING_CEIL`/`OPENING_CEILS` reducer cases)

`state.board.map((cell) => ({ ...cell, opening: false }))` allocates a new array and a new object for **every cell** on the board. This action is dispatched from `MinesweeperBoard.tsx`'s `handleCellMouseEnter` (around lines 61-63, wired via an effect at lines 33-41) on every single `mousemove` across the grid. On an Expert board (480 cells), this means a full board reallocation + re-render on every pixel the mouse crosses while hovering — likely the most visible source of jank in the app today.

**Fix direction**: only update the cells whose `opening` flag actually changes (e.g. track the previously-opened set and diff), or store "currently opening" as a separate small piece of state (a `Set<index>` or single index) rather than a flag baked into every cell object.

### P3. Zero `React.memo` usage anywhere in the codebase
Confirmed via grep — no `memo(` calls in `src/`. Components rendered in loops inside frequently-updating parents — `MinesweeperCell` (`src/programs/minesweeper/MinesweeperCell.tsx`), `TaskbarPellet` (`src/components/taskbar/TaskbarPellet.tsx`), start-menu buttons — always re-render when their parent does, regardless of whether their own props changed. This compounds P1 and P2: a context update or a board hover re-renders far more than necessary.

**Fix direction**: wrap leaf components rendered in loops/hot paths in `React.memo`, once their props are stable (pairs well with fixing P1/P7 so props aren't recreated every render anyway).

### P4. No code-splitting for game windows
**File**: `src/components/bootup/Desktop.tsx:4-6` (imports), `vite.config.ts` (no `manualChunks`)

`MinesweeperWindow`, `PinballWindow`, `SolitaireWindow` are static top-level imports, conditionally *rendered* (`openApps.x && <...>`) but not conditionally *loaded*. There's no `React.lazy`/`Suspense` anywhere in `src` (grep-confirmed) and no `build.rollupOptions.output.manualChunks` in `vite.config.ts`. All three games' wrapper components, hooks, and asset modules (e.g. `minesweeperSprites.ts`, `minesweeperAssets.ts`) ship in the main bundle even for a visitor who never opens the Start Menu.

**Fix direction**: `React.lazy(() => import("./MinesweeperWindow"))` + `Suspense` per game window in `Desktop.tsx`, so each game's code/assets only load on first open.

### P5. Window resize has no throttle (drag does)
**File**: `src/components/window/Window.tsx:184-213` (resize) vs `127-152` (drag)

`handleDragMove` throttles to ~16ms via `performance.now()` (`Window.tsx:131-133`), but `handleResizeMove` has no equivalent throttle — `setSize` fires on every raw `mousemove` event during a resize.

**Fix direction**: apply the same throttle pattern used in `handleDragMove` to `handleResizeMove`.

### P6. Drag/resize commit to React state on every tick
**File**: `Window.tsx:142-151` (drag), `195-212` (resize)

Even with throttling, each tick calls `setPosition`/`setSize`, causing a full React re-render/reconciliation of the window's subtree (title bar, icon, control buttons, `MenuBar`, children) rather than mutating position/size directly.

**Fix direction**: during drag/resize, mutate `left`/`top`/`width`/`height` directly on the DOM node via a ref, and only call `setPosition`/`setSize` once on drag/resize end to commit to React state.

### P7. Inline object/array/function literals rebuilt every render
**Files**: `MinesweeperWindow.tsx:38-67`, `PinballWindow.tsx:83-121`, `SolitaireWindow.tsx:29-44`, `Window.tsx:237-253` (`windowStyle`)

`menus` arrays (with nested `onSelect` arrow functions) passed to `MenuBar` are rebuilt from scratch every render. Low-impact today since `MenuBar` isn't memoized either, but it blocks memoizing `MenuBar` later, and the pattern repeats across all three game windows.

**Fix direction**: wrap each `menus` array in `useMemo`, and the `onSelect` callbacks in `useCallback`, once `MenuBar` is memoized (pairs with P3).

### P8. Missing dependency array on win-check effect
**File**: `src/hooks/useMinesweeper.ts:205-211`

`useEffect(() => {...})` has no third argument, so it runs after *every* render of any consumer of the hook, re-filtering the entire board array each time rather than only when the board actually changes.

**Fix direction**: add a dependency array (likely `[state.board]` or the specific derived value it checks).

### P9. ~~Linear scan for a window's own state~~ — DONE (fixed as a byproduct of P1)

Originally: each `Window` did `openWindows.find(...)` to read its own `isMinimized` flag — an O(n) scan, redundant given the provider already keyed windows by id. The P1 rewrite replaced this with `useIsWindowMinimized(id)`, a direct id-keyed lookup into the store (`windowStore.ts`'s `getIsMinimized(id)`) — no scan involved.

### P10. `new Audio(...)` re-evaluated every render
**File**: `src/components/bootup/BootSequence.tsx:23`

`useRef(new Audio(startupSound))` — React evaluates the argument expression to `useRef` on every render even though only the first call's result is kept, so a throwaway `Audio` element is constructed and discarded on every render after the first. Low-impact since `BootSequence` rarely re-renders, but it's a lazy-init anti-pattern.

**Fix direction**: `useRef<HTMLAudioElement | null>(null)` + initialize once in an effect, or use the lazy-initializer function form.

### P11. Taskbar clock has no timer
**File**: `src/components/taskbar/Taskbar.tsx:16-21`

`const now = new Date()` is computed directly in the render body with no `setInterval`/state — the displayed time only updates when `Taskbar` happens to re-render for an unrelated reason (e.g. a focus change via P1), not on any actual timer.

**Fix direction**: add a `setInterval`-driven state update (e.g. tick every second or every 30s, matching XP clock granularity) so it behaves like a real clock independent of other re-renders.

---

## Readability / code-quality findings

### Duplication across window components

**R1. Duplicated iframe-bridge type + accessor pattern**
`PinballWindow.tsx:14-20,77-81` and `SolitaireWindow.tsx:13-15,23-27` each independently declare a `*FrameWindow = Window & {...bridge}` type and a `bridge()` closure that does `iframeRef.current?.contentWindow as *FrameWindow | null`. Identical shape, never unified — despite the codebase's own convention of extracting shared window-loading logic (see `useProgressCursor`, `preloadImages` in `CLAUDE.md`).
**Fix direction**: extract a shared `useIframeBridge<T>(iframeRef)` hook returning a typed accessor, used by both windows.

**R2. Two different "wait for embedded game ready" strategies**
Pinball uses a custom-event + `MIN_LOADING_MS` + `queueMicrotask` sequence (`PinballWindow.tsx:24-73`); Solitaire uses a plain `onLoad` callback. Both feed the same `useProgressCursor(!loaded)` pattern but via unrelated mechanisms.
**Fix direction**: if the underlying games' readiness signals genuinely differ, document why inline; otherwise consider a shared abstraction.

### Silent error handling

**R3. Bridge calls fail silently**
`PinballWindow.tsx:42-117` and `SolitaireWindow.tsx:33-38` call bridge methods via optional chaining (`mute_game_audio?.()`, `bridge()?.deal()`, etc.) with no fallback or logging. If the embedded game's bridge API ever changes/renames, the corresponding menu action just stops working with zero dev-facing signal.
**Fix direction**: log (at least in dev) when a bridge method is called but not found, so a breaking change in the embedded game surfaces immediately instead of as a silent no-op bug report.

**R4. Failed image preload treated as success**
`src/utils/preloadImages.ts:6-9` — `img.onerror = () => resolve()` resolves as if the load succeeded. Combined with `MinesweeperWindow.tsx:36` (`if (!loaded) return null`), a failed sprite fetch is indistinguishable from a slow one — the game renders with broken `<img>` tags and no retry/error UI.
**Fix direction**: reject (or resolve with a per-image success flag) on `onerror`, and decide/handle what the window should render if a required asset fails to load.

### Dead / stub code

**R5. TODO stub wired into production Help menu**
`MinesweeperWindow.tsx:62-63` — `onSelect: () => console.log("TODO: 'How to play?' window not built yet")`. Clicking "How to play?" does nothing visible and spams the console.
**Fix direction**: either build the help window/dialog, or remove the menu item until it exists.

**R6. Dead/no-op controls in the Start Menu**
`StartMenu.tsx:48-58` — "All Programs" button has no `onClick` at all. `startMenuItems.ts`'s `resume` link uses `href: "#"`. Both silently do nothing when clicked.
**Fix direction**: wire them up, or remove/disable them until they're implemented, so a user click isn't a silent dead end.

**R7. Start-menu apps with no window behind them** *(known open work per CLAUDE.md, not a bug)*
5 of 8 `startMenuApps` entries (`projects`, `cv`, `notepad`, `paint`, `contact`) have no corresponding `<Window>` in `Desktop.tsx` yet. Worth noting for whoever picks this up: `id` is typed as bare `string` (see R12) with no compile-time link to what `Desktop.openApp` actually handles, so this drift is invisible to the type checker.

**R8. Commented-out dev toggle committed** *(currently in the correct state)*
`src/App.tsx:2,5` — the `Desktop` import and `return <Desktop />` are commented out (documented in `CLAUDE.md` as a normal dev-only toggle to skip the boot animation). It's currently in the *correct* state for committing (BootSequence active), but leaving commented-out code around rather than toggling it live is itself a minor smell worth being mindful of before each commit.

### TypeScript looseness

**R9. Redundant non-null assertion**
`Taskbar.tsx:35` — `taskbarElement!.offsetHeight` right after `taskbarElement` was already null-checked (`if (!taskbarElement) return;`) earlier in the same closure. The `!` is unnecessary since the variable is already narrowed.
**Fix direction**: remove the assertion; TypeScript should already narrow the type in that scope (if it doesn't due to closure timing, that's worth understanding rather than suppressing with `!`).

**R10. Repeated unchecked type casts**
- `PinballWindow.tsx:42,53,79` / `SolitaireWindow.tsx:25` — repeated `as *FrameWindow | null` casts on `iframe.contentWindow` (ties to R1 — a shared hook would centralize this).
- `MenuBar.tsx:17`, `Taskbar.tsx:49`, `WindowManagerProvider.tsx:12`, `Minesweeper.tsx:23` — four separate `event.target as Node` casts, all implementing the same "did this click land outside my ref" check.
**Fix direction**: extract a `useClickOutside(ref, handler)` hook to remove the duplicated cast + listener logic; extract `useIframeBridge` per R1 for the other cast.

**R11. ~~Shared types live outside `src/types/`~~ — resolved (as a byproduct of P1)**
Originally: `OpenWindow` and `WindowManagerContextValue` were defined in `src/context/windowManagerContext.ts` rather than `src/types/`, breaking the documented convention. The P1 rewrite removed both types entirely — the context now just holds a `WindowStore` (typed in `windowStore.ts`) — so the convention violation no longer applies. `WindowStore`/`WindowMeta`/`WindowListEntry` living in `windowStore.ts` alongside the store that produces them is intentional, not a repeat of this issue.

**R12. Window/app ids typed as bare `string`**
`types/startMenu.ts` and the window `id` props (`Window.tsx`, `windowManagerContext.ts`) type `id` as plain `string`, even though `CLAUDE.md` documents ids as hardcoded literals (`"minesweeper"`, `"pinball"`, `"solitaire"`). A string-literal union would catch drift like R7 at compile time.
**Fix direction**: define a shared union type (e.g. `type AppId = "minesweeper" | "pinball" | "solitaire" | ...`) and use it everywhere an app/window id is passed around. Note this touches several files — worth doing as a standalone, deliberate change rather than bundled with an unrelated fix.

### Components/hooks mixing concerns

**R13. `Window.tsx` mixes several responsibilities in one 320-line file**
Registration/focus side effects, minimize/maximize state, drag state + mouse-move math, resize state + mouse-move math (3 directions), taskbar-height lookup, and the full render tree all live in one component. Drag (`handleTitleBarMouseDown`/`handleDragMove`/`handleDragEnd`, ~lines 113-158) and resize (`handleResizeStart`/`handleResizeMove`/`handleResizeEnd`, ~lines 167-219) are near-identical state-machine shapes.
**Fix direction**: extract `useDraggable` and `useResizable` hooks (could share a common base), shrinking `Window.tsx` to registration + render, and making the drag/resize math independently reasoned about (pairs well with P5/P6, which touch the same code).

**R14. `useMinesweeper.ts` mixes pure algorithms with React state**
The 289-line hook combines board-generation math (`createBoard`, `getNearIndexes`, `pickRandomIndexes`, `insertMines`, `floodFillIndexes`, ~lines 21-104), a full reducer, a private `useTimer` hook, and the public action API, all in one file. The board/graph algorithms have no React dependency.
**Fix direction**: move the pure algorithm functions into a plain `.ts` module (e.g. `minesweeperBoard.ts`) imported by the hook — improves readability and makes the algorithms testable in isolation without React.

**R15. Dense, uncommented bitmask logic for chord-click detection**
`MinesweeperBoard.tsx:33-63` — `event.buttons === 3`, `event.button === 2 && event.buttons === 2` etc. implement chord-vs-single-open detection via `MouseEvent.buttons` bitmask, denser than the rest of the codebase's comment style.
**Fix direction**: extract a named helper (e.g. `isChordClick(event)`) with a short comment explaining the bitmask, so intent is scannable without knowing the `buttons` bitmask spec by heart.

### Magic numbers

**R16. Unexplained pixel offsets**
`minesweeperConfig.ts:15-16` — `columns * CELL_SIZE + 25` and `rows * CELL_SIZE + 112` have no comment explaining what the `25`/`112` account for (chrome for the score panel/border), unlike `Window.tsx`'s `INFO_STRIP_HEIGHT`, which is commented.
**Fix direction**: name these constants (e.g. `BOARD_HORIZONTAL_CHROME_PX`, `BOARD_VERTICAL_CHROME_PX`) with a short comment.

**R17. `CELL_SIZE` re-hardcoded in three places**
`CELL_SIZE = 24` is defined once in `minesweeperConfig.ts`, but `MinesweeperBoard.tsx`'s inline grid template (`repeat(${columns}, 24px)`) and `MinesweeperCell.tsx`'s Tailwind classes (`h-6 w-6`) re-hardcode the same value independently. If `CELL_SIZE` ever changes, two of the three usages won't follow.
**Fix direction**: derive the grid template and cell sizing from the single `CELL_SIZE` constant (e.g. inline style using the constant instead of Tailwind's fixed `h-6 w-6`).

**R18. Unlabeled boot-stage durations**
`BootSequence.tsx:31,34,37,40` — `wait(1000)`, `wait(7000)`, `wait(1000)`, `wait(2000)` are magic numbers for each boot stage's duration.
**Fix direction**: name each as a constant (e.g. `BLACK_SCREEN_MS`, `STARTUP_LOGO_MS`, `WELCOME_MS`, `LOGIN_MS`) so the boot timeline is self-documenting.

### Naming / organization inconsistency

**R19. Same component imported under two different names**
`MinesweeperWindow.tsx` imports the shared window component as `Window`, while `PinballWindow.tsx`/`SolitaireWindow.tsx` alias the same import as `XPWindow`. No functional reason for the split; makes searching/reading harder.
**Fix direction**: pick one alias (or none) and use it consistently across all three window components.

**R20. Taskbar "clock" is a stale snapshot, not a clock**
`Taskbar.tsx:16-21` — variable named `time`, computed as a one-shot `new Date()` per render. The name implies a live clock, but it only changes when something else re-renders `Taskbar`. See P11 for the actual fix (add a timer); this entry is about the misleading naming/intent if P11 isn't done — at minimum, rename or comment to clarify it's not live.

### Accessibility

**R21. In-window menu bar has no keyboard support**
`MenuBar.tsx` — menu tabs and dropdown rows are `<div>`s using `onMouseDown`/`onMouseUp` with a `pointer` class, not `<button>`/`role="menuitem"`. No `tabIndex`, no Enter/Space/Arrow-key activation, no `role="menu"`/`role="menubar"`. Contrast with `WindowCloseButton`/`WindowMinimizeButton`/`WindowMaximizeButton`, which correctly use real `<button aria-label="...">`.
**Fix direction**: convert menu tabs/items to real buttons with appropriate ARIA roles and keyboard handlers (Enter/Space to activate, Arrow keys to navigate, Escape to close) — a meaningful but non-trivial UX change to the menu interaction model; worth discussing scope before starting.

**R22. Minesweeper is entirely mouse-only**
`MinesweeperCell.tsx` cells are `<div onMouseDown/onMouseEnter>` with no `role`, `tabIndex`, or keyboard equivalent; `MinesweeperBoard.tsx`'s chord-click detection (R15) is also mouse-`buttons`-bitmask only. The game cannot be played via keyboard at all.
**Fix direction**: this is a larger feature addition (keyboard focus grid + open/flag key bindings) rather than a small fix — worth scoping as its own task rather than bundling with other cleanup.

---

## Recommended triage

- **Done**: P1 (window-manager store + selective subscriptions), P9 (fixed as a byproduct of P1), R11 (resolved as a byproduct of P1).
- **High-value, low-risk (worth doing regardless of scale)**: P2 + P3 (fix Minesweeper hover reallocation + memoize hot components), P4 (lazy-load game windows), P8 (missing effect dep), R5 (remove console.log stub), R6 (fix or remove dead Start Menu controls), R1 + R10 (extract `useIframeBridge`/`useClickOutside`).
- **Nice-to-have polish**: P5 (resize throttle), P6 (ref-based drag/resize), P10 (`Audio` lazy-init), P11/R20 (real taskbar clock), R16-R18 (named magic-number constants), R13-R14 (split `Window.tsx`/`useMinesweeper.ts`).
- **Bigger lift, scope before starting**: R21-R22 (keyboard accessibility for `MenuBar` and Minesweeper — touches core interaction model), R12 (string-literal union for ids — touches several files).
- **Skip unless it becomes a real issue**: P7 (inline literals in menus), R19 (naming alias inconsistency) — cosmetic/negligible at current app scale.
