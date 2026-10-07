---
paths:
  - "src/App.tsx"
  - "src/components/bootup/**/*.tsx"
  - "src/components/bootup/**/*.ts"
---

# Boot Flow

`App.tsx` renders either `BootSequence` (the full black screen → startup logo → welcome → login → desktop chain, driven by a `Stage` union and `await wait(ms)` in `runBoot()`) or `Desktop` directly. During development it's normal to toggle which one is commented out in `App.tsx` so the desktop renders immediately, skipping the boot animation — restore `<BootSequence />` before committing.

## Layout

`src/components/bootup/` holds `BootSequence.tsx` and `bootupAssets.ts` at the root, full-screen stages in `screens/`, and the desktop plus its dialogs in `desktop/`.

`SessionScreenLayout` (`screens/SessionScreenLayout.tsx`) is the shared shell for the blue session screens (`WelcomeScreen`, `LoginScreen`, `ShutdownScreen`): gradient background, top and bottom bars, centered `children`, optional `footer` inside the bottom bar. New blue screens wrap it rather than re-creating the bars. `BlackScreen` / `StartupScreen` are black and don't use it.

## Log off / restart

`BootSequence` owns the power flow and hands `onLogOff` / `onRestart` to `Desktop` (both optional, so a bare `<Desktop />` still renders — the dialog buttons are then no-ops):

- **Log off** → `setStage("login")` immediately; `Desktop` unmounts, so open windows are gone.
- **Restart** → `logging-off` (2s) → `shutting-down` (2.5s, plays `shutdown-windows.mp3`) → `black-1` + `runBoot()` again. Both stages render `<ShutdownScreen phase={stage} />`, which owns the per-phase text — `WelcomeScreen` takes no props and only shows the big "welcome".

Every timeline (`runBoot`, `handleRestart`) captures an id from `runIdRef` and bails after each `await wait()` if the id has moved on — bump `runIdRef` whenever a timeline should be abandoned (unmount, log off, a new restart). Any new timed stage chain must follow the same guard.

`PowerDialog` (`src/components/bootup/desktop/PowerDialog.tsx`) is the XP "Log Off" / "Turn off" modal, `mode: "logoff" | "shutdown"`. `Desktop` holds `powerDialog` state, applies the grayscale/brightness filter to its root div while it's open, and renders the dialog as a _sibling_ of that div so the filter doesn't hit it. The filter makes the root a containing block for `fixed` descendants (taskbar), which is why the root is `h-screen overflow-hidden`. The Shut Down option is intentionally disabled (matches the reference site) — only Restart, Log Off and Cancel/Escape do anything. Dialog icons are in `BOOT_PRELOAD_ASSET_URLS`.
