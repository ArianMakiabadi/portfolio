// Plain (non-React) pub/sub store for window-manager state: registry, active
// window, z-indexes, and registered DOM elements. Lives outside React state so
// consumers can subscribe via useSyncExternalStore to just the slice they need
// (see useWindowManager.ts) instead of re-rendering on every unrelated change.
export type WindowMeta = {
  title: string;
  iconSrc: string;
};

export type WindowListEntry = {
  id: string;
  title: string;
  iconSrc: string;
};

type WindowEntry = WindowMeta & { isMinimized: boolean };

type Listener = () => void;

export function createWindowStore() {
  const windows = new Map<string, WindowEntry>();
  const zIndexes = new Map<string, number>();
  const elements = new Map<string, HTMLElement>();
  const listeners = new Set<Listener>();

  let activeWindowId: string | null = null;
  let highestZIndex = 0;
  let listSnapshot: WindowListEntry[] = [];

  function emit() {
    listeners.forEach((listener) => listener());
  }

  function rebuildListSnapshot() {
    listSnapshot = Array.from(windows.entries()).map(
      ([id, { title, iconSrc }]) => ({
        id,
        title,
        iconSrc,
      }),
    );
  }

  return {
    subscribe(listener: Listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },

    getWindowList: () => listSnapshot,
    getActiveWindowId: () => activeWindowId,
    getIsActive: (id: string) => activeWindowId === id,
    getIsMinimized: (id: string) => windows.get(id)?.isMinimized ?? false,
    getZIndex: (id: string) => zIndexes.get(id) ?? 0,

    registerWindow(id: string, meta: WindowMeta) {
      windows.set(id, { ...meta, isMinimized: false });
      rebuildListSnapshot();
      emit();
    },

    unregisterWindow(id: string) {
      if (!windows.has(id)) return;
      windows.delete(id);
      zIndexes.delete(id);
      rebuildListSnapshot();
      if (activeWindowId === id) activeWindowId = null;
      emit();
    },

    focusWindow(id: string) {
      let changed = false;

      if (activeWindowId !== id) {
        activeWindowId = id;
        changed = true;
      }

      const entry = windows.get(id);
      if (entry?.isMinimized) {
        windows.set(id, { ...entry, isMinimized: false });
        changed = true;
      }

      const currentZIndex = zIndexes.get(id) ?? 0;
      if (currentZIndex === 0 || currentZIndex !== highestZIndex) {
        highestZIndex += 1;
        zIndexes.set(id, highestZIndex);
        changed = true;
      }

      if (changed) emit();
    },

    minimizeWindow(id: string) {
      const entry = windows.get(id);
      if (!entry || entry.isMinimized) return;

      windows.set(id, { ...entry, isMinimized: true });
      if (activeWindowId === id) activeWindowId = null;
      emit();
    },

    registerWindowElement(id: string, element: HTMLElement | null) {
      if (element) {
        elements.set(id, element);
      } else {
        elements.delete(id);
      }
    },

    isPointInsideAnyWindow(target: Node) {
      return Array.from(elements.values()).some((element) =>
        element.contains(target),
      );
    },

    blurActive() {
      if (activeWindowId === null) return;
      activeWindowId = null;
      emit();
    },
  };
}

export type WindowStore = ReturnType<typeof createWindowStore>;
