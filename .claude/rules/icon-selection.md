---
paths:
  - "src/components/shared/IconItem.tsx"
  - "src/hooks/useIconSelection.ts"
  - "src/components/bootup/desktop/DesktopIcons.tsx"
  - "src/components/projects/ProjectList.tsx"
  - "src/components/window/ProjectsWindow.tsx"
---

# Icon Items & Selection

Any XP-style selectable icon (desktop shortcut, folder/file in an Explorer view) is the shared `IconItem` (`src/components/shared/IconItem.tsx`) — `variant: "desktop"` (stacked, white shadowed label) or `"list"` (icon beside black label). It is purely presentational: single mousedown → `onSelect`, double-click → `onOpen`, selected look = dimmed icon + `#0B61FF` label highlight. Add a new `variant` rather than a second icon component.

Selection state comes from `useIconSelection()` (`src/hooks/useIconSelection.ts`), one call per icon group, returning `{ selectedId, select, containerProps }`. Spread `containerProps` on the element wrapping the group: its `onMouseDown` clears the selection unless the press landed inside a `[data-icon-item]` (the attribute `IconItem` sets on its root — keep the two in sync). Selection is single-item only and each group is independent (desktop vs. projects list don't clear each other).

Call the hook in whichever component must outlive the icon list: `DesktopIcons` owns its own, but `ProjectsWindow` owns the projects selection and passes the whole `IconSelection` object down to `ProjectList`, so the highlighted project survives opening a detail view and coming Back.
