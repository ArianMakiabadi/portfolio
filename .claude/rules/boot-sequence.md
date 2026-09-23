---
paths:
  - "src/App.tsx"
  - "src/components/bootup/**/*.tsx"
  - "src/components/bootup/**/*.ts"
---

# Boot Flow

`App.tsx` renders either `BootSequence` (the full black screen → startup logo → welcome → login → desktop chain, driven by a `Stage` union and `await wait(ms)` in a single effect) or `Desktop` directly. During development it's normal to toggle which one is commented out in `App.tsx` so the desktop renders immediately, skipping the boot animation — restore `<BootSequence />` before committing.
