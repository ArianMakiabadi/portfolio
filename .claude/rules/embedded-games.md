---
paths:
  - "src/programs/pinball/**/*.tsx"
  - "src/programs/solitaire/**/*.tsx"
  - "src/programs/paint/**/*.tsx"
  - "public/programs/pinball/**"
  - "public/programs/solitaire/**"
  - "public/programs/paint/**"
---

# Embedded Programs (iframe + bridge)

Solitaire and Pinball are not native React — they're standalone HTML/JS(/WASM) bundles that live in `public/programs/<name>/` (untouched by the TS build) and load into a same-origin `<iframe src="/programs/<name>/...">`. The game script attaches a `window.<name>Bridge` object inside the iframe (e.g. `window.solitaireBridge`, `window.pinballBridge`); the `<Name>Window` component reads `iframeRef.current.contentWindow.<name>Bridge` on demand to wire the XP `MenuBar` (new game, exit, etc.) to the embedded game. There's no live subscription — the bridge is polled/called imperatively per menu click, not stored in state. `PinballWindow` additionally deals with WASM audio-autoplay gesture rules (`mute_game_audio`/`unmute_game_audio`/`resume_game_audio` on the frame window, called from a `game-loaded` event handler deferred with `queueMicrotask` because the game wires those globals up asynchronously after dispatching the event) and focuses the game's canvas manually so keyboard controls work immediately. When adding another embedded game, follow this same pattern rather than trying to port the game to React.

Paint (`src/programs/paint/`, `public/programs/paint/`) is a vendored, heavily stripped-down jspaint embedded the same way, but with **no bridge**: `JsPaintWindow`'s XP `MenuBar` only drives the outer window (Exit, Maximize via the `WindowHandle` ref, Minimize via `minimizeWindow`), the rest of its menus are disabled placeholders, and all drawing UI is jspaint's own inside the iframe. It has no `game-loaded` event either — readiness is the iframe's native `load`, backed by a `LOAD_FALLBACK_MS` (4s) timeout because jspaint hotlinks remote images that can stall `load` indefinitely. The vendored bundle has had save/download, help/about, localization, themes, keyboard shortcuts and Electron/PWA code removed; don't reintroduce those, and keep stripping rather than patching around dead features.
