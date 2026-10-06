---
paths:
  - "src/components/window/ProjectsWindow.tsx"
  - "src/components/projects/**/*.tsx"
  - "src/data/projects.ts"
  - "src/types/project.ts"
---

# Projects Window

Project content is data, not markup. `src/data/projects.ts` exports `projectCategories: ProjectCategory[]` (types in `src/types/project.ts`); each `Project` has `id`, `name` (icon label + address-bar segment), `icon`, `title` (detail heading) and optional `date`, `tools` (`{icon, label}` tech badges, icons from `src/assets/projects/tools/*.svg`), `repoUrl`, `siteUrl`, and `blocks`. `blocks` is a discriminated union on `type` — `"paragraphs"`, `"list"`, `"image"` — each with a `title` rendered as a section heading. Adding or editing a project means editing `projects.ts` only; to support a new kind of content, add a `ProjectBlock` variant and a `case` in `ProjectDetail`'s `BlockContent` switch (no `default` — keep it exhaustive). A project with no `blocks` shows "Details coming soon.". Block `title`s are used as React keys, so keep them unique within a project.

`ProjectsWindow` holds all state and is a two-view Explorer: `activeId === null` → `ProjectList` (categories of `IconItem`s, double-click opens), otherwise → `ProjectDetail`. There is no router or history stack — toolbar Back and Up both just `setActiveId(null)`, Back is `disabled` on the list view, and the address-bar `path` is derived (`My Projects` / `My Projects/<name>`). The menu bar's Edit/View/Tools menus, most toolbar buttons and the "System Tasks"/"Other" left-menu sections are non-functional XP dressing; only the "Details" section carries real links.

`ProjectDetail` scrolls its own content; the "Visit website" button is absolutely positioned over the scroll area's bottom-right (hence the content's `pb-10`), while "View repository" is inline at the end of the content.
