import { useEffect, useState, type ReactNode } from "react";
import { WindowManagerContext } from "./windowManagerContext";
import { createWindowStore } from "./windowStore";

// Wrap the app (see Desktop.tsx) in this once to enable the window
// system. Creates a single WindowStore for the app's lifetime and owns the
// document-level "click outside every window" listener that clears focus.
export function WindowManagerProvider({ children }: { children: ReactNode }) {
  const [store] = useState(createWindowStore);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (!store.isPointInsideAnyWindow(target)) store.blurActive();
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [store]);

  return (
    <WindowManagerContext.Provider value={store}>
      {children}
    </WindowManagerContext.Provider>
  );
}
