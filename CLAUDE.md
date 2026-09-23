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

## Architecture & conventions

Documented as path-scoped rules under `.claude/rules/` — they load automatically when Claude works with the relevant files, instead of always being in context. See `.claude/rules/*.md` for boot flow, window management, taskbar/start-menu wiring, embedded games, native programs, loading states, styling, and other conventions.
