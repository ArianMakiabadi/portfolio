# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Vite dev server
npm run dev:all  # Vite + inquiry backend (server/) together; Vite proxies /api → 127.0.0.1:3001
npm run build    # tsc -b (typecheck, project references) then vite build
npm run lint     # eslint .
npm run preview  # serve the production build
```

No frontend tests. Backend (`server/`, own package.json, not a workspace): `npm --prefix server test` (Vitest + Supertest), `npm --prefix server run typecheck`. Frontend: `npm run build` is the typecheck gate — `tsconfig.app.json` enables `noUnusedLocals`/`noUnusedParameters`, so unused imports break the build, not just lint.

The README is the stock Vite template README and describes nothing about this project.

## Response style

be extremly concise, sacrifice grammer for the sake of consision.

## What this is

A personal portfolio built as a recreation of the Windows XP desktop in React 19 + TypeScript + Vite + Tailwind v4. Portfolio content opens as draggable XP windows launched from the Start menu or from desktop icons. Wired apps so far: My Projects (native, data-driven Explorer-style window), Contact (form → Express backend in `server/`), Minesweeper (native), Solitaire, 3D Pinball and Paint (embedded iframe apps). `cv`, `notepad` exist as Start menu entries in `startMenuItems.ts` but have no `<Window>` behind them yet. Contact form work is tracked in `docs/prd/contact-form/`.

## Architecture & conventions

Documented as path-scoped rules under `.claude/rules/` — they load automatically when Claude works with the relevant files, instead of always being in context. See `.claude/rules/*.md` for boot flow, window management, taskbar/start-menu/desktop-icon wiring, embedded games, native programs, the projects window, icon selection, loading states, styling, and other conventions.

## Agent skills

### Issue tracker

Issues/PRDs live as local markdown under `docs/prd/<feature>/`; never publish to GitHub Issues. See `docs/agents/issue-tracker.md`.

### Triage labels

Default five roles (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`), recorded as `Status:` lines. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: root `GLOSSARY.md` + `docs/adr/` (created lazily). See `docs/agents/domain.md`.
