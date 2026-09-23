---
paths:
  - "src/programs/pinball/**/*.tsx"
  - "src/programs/solitaire/**/*.tsx"
  - "public/programs/pinball/**"
  - "public/programs/solitaire/**"
---

# Embedded Games (iframe + bridge)

Solitaire and Pinball are not native React — they're standalone HTML/JS(/WASM) bundles that live in `public/programs/<name>/` (untouched by the TS build) and load into a same-origin `<iframe src="/programs/<name>/...">`. The game script attaches a `window.<name>Bridge` object inside the iframe (e.g. `window.solitaireBridge`, `window.pinballBridge`); the `<Name>Window` component reads `iframeRef.current.contentWindow.<name>Bridge` on demand to wire the XP `MenuBar` (new game, exit, etc.) to the embedded game. There's no live subscription — the bridge is polled/called imperatively per menu click, not stored in state. `PinballWindow` additionally deals with WASM audio-autoplay gesture rules (`mute_game_audio`/`unmute_game_audio`/`resume_game_audio` on the frame window, called from a `game-loaded` event handler deferred with `queueMicrotask` because the game wires those globals up asynchronously after dispatching the event) and focuses the game's canvas manually so keyboard controls work immediately. When adding another embedded game, follow this same pattern rather than trying to port the game to React.
