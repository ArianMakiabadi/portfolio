---
paths:
  - "src/components/taskbar/Taskbar.tsx"
  - "src/components/window/Window.tsx"
---

# Taskbar Coupling

`Taskbar.tsx` measures its own height with a `ResizeObserver` and writes it to the `--taskbar-height` CSS variable on `<html>`. `Window.tsx` reads that variable back (`getTaskbarHeight()`, fallback 30) to clamp dragging and resizing above the taskbar, and uses it in the maximized height calculation. Don't hardcode the taskbar height on either side.
