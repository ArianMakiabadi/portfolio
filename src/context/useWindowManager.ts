import { useContext, useMemo, useSyncExternalStore } from "react";
import { WindowManagerContext } from "./windowManagerContext";

// Hooks for consuming the window manager. Use `useWindowManager` for the
// stable action callbacks (register/focus/minimize/etc, e.g. from Window.tsx
// on mount or a title-bar click). Use the per-slice hooks below when a
// component only cares about one reactive value — each only re-renders that
// component when its own selected value actually changes, not on every
// window-manager update (see windowStore.ts for why this matters).
function useWindowStore() {
  const store = useContext(WindowManagerContext);
  if (!store) {
    throw new Error(
      "useWindowManager must be used within a WindowManagerProvider",
    );
  }
  return store;
}

export function useWindowManager() {
  const store = useWindowStore();
  return useMemo(
    () => ({
      registerWindow: store.registerWindow,
      unregisterWindow: store.unregisterWindow,
      focusWindow: store.focusWindow,
      minimizeWindow: store.minimizeWindow,
      registerWindowElement: store.registerWindowElement,
    }),
    [store],
  );
}

export function useIsWindowActive(id: string) {
  const store = useWindowStore();
  return useSyncExternalStore(store.subscribe, () => store.getIsActive(id));
}

export function useIsWindowMinimized(id: string) {
  const store = useWindowStore();
  return useSyncExternalStore(store.subscribe, () => store.getIsMinimized(id));
}

export function useWindowZIndex(id: string) {
  const store = useWindowStore();
  return useSyncExternalStore(store.subscribe, () => store.getZIndex(id));
}

export function useWindowList() {
  const store = useWindowStore();
  return useSyncExternalStore(store.subscribe, store.getWindowList);
}

export function useActiveWindowId() {
  const store = useWindowStore();
  return useSyncExternalStore(store.subscribe, store.getActiveWindowId);
}
