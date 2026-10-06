---
paths:
  - "src/**/*.ts"
  - "src/**/*.tsx"
---

# Code Style Conventions

- Assets are imported as ES modules (`import icon from "@/assets/..."`) so Vite fingerprints them; images are `.webp` (some third-party game icons are `.png`; tech/brand logos under `src/assets/projects/tools/` are `.svg`), sounds are `.mp3` played through `utils/audio.ts`'s `playSound`. Exception: embedded-game assets in `public/programs/` are plain static files referenced by URL string, not imported — they're served as-is, not bundled.
- Components are function declarations with a `export default` at the bottom, props typed via a local `type XProps = {...}`. Shared types go in `src/types/`.
- Placement: a program's `<Name>Window` + its content live together in `src/programs/<name>/`; portfolio-content windows live in `src/components/window/` (`ProjectsWindow`) with their content components in `src/components/<feature>/` (`components/projects/`). Components reused across features go in `src/components/shared/` (`IconItem`).
- `@` resolves to `src/` (configured in `vite.config.ts` and `tsconfig.app.json`). Use `@/...` for any import that crosses directories (e.g. `@/utils/audio`, `@/types/window`); keep same-directory imports relative (`./Sibling`).
