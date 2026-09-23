---
paths:
  - "src/hooks/useMinesweeper.ts"
  - "src/programs/minesweeper/**/*.tsx"
  - "src/programs/minesweeper/**/*.ts"
---

# Native Programs (e.g. Minesweeper)

State lives in a `use<Name>` hook under `src/hooks/`, returning `{state, actions}`; the `<Name>Window` component only wires `actions` into the `MenuBar` and passes the whole hook result down to a presentational `<Name>` component. Keep game logic out of the `Window`-wrapping component.
