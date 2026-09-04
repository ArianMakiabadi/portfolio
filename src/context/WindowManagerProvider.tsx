import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { WindowManagerContext, type OpenWindow } from "./windowManagerContext";

type WindowRegistryEntry = {
  title: string;
  iconSrc: string;
  isMinimized: boolean;
};

export function WindowManagerProvider({ children }: { children: ReactNode }) {
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);
  const [windows, setWindows] = useState<Record<string, WindowRegistryEntry>>(
    {},
  );
  const [zIndexes, setZIndexes] = useState<Record<string, number>>({});
  const highestZIndexRef = useRef(0);
  const elementsRef = useRef<Map<string, HTMLElement>>(new Map());

  const openWindows: OpenWindow[] = useMemo(
    () =>
      Object.entries(windows).map(([id, entry]) => ({
        id,
        ...entry,
      })),
    [windows],
  );

  const getZIndex = useCallback(
    (id: string) => zIndexes[id] ?? 0,
    [zIndexes],
  );

  const registerWindow = useCallback(
    (id: string, meta: { title: string; iconSrc: string }) => {
      setWindows((prev) => ({
        ...prev,
        [id]: { ...meta, isMinimized: false },
      }));
    },
    [],
  );

  const unregisterWindow = useCallback((id: string) => {
    setWindows((prev) => {
      if (!(id in prev)) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
    setActiveWindowId((current) => (current === id ? null : current));
  }, []);

  const focusWindow = useCallback((id: string) => {
    setActiveWindowId(id);
    setWindows((prev) =>
      prev[id]?.isMinimized
        ? { ...prev, [id]: { ...prev[id], isMinimized: false } }
        : prev,
    );
    setZIndexes((prev) => {
      const current = prev[id] ?? 0;
      if (current !== 0 && current === highestZIndexRef.current) return prev;
      highestZIndexRef.current += 1;
      return { ...prev, [id]: highestZIndexRef.current };
    });
  }, []);

  const minimizeWindow = useCallback((id: string) => {
    setWindows((prev) =>
      prev[id] ? { ...prev, [id]: { ...prev[id], isMinimized: true } } : prev,
    );
    setActiveWindowId((current) => (current === id ? null : current));
  }, []);

  const registerWindowElement = useCallback(
    (id: string, element: HTMLElement | null) => {
      if (element) {
        elementsRef.current.set(id, element);
      } else {
        elementsRef.current.delete(id);
      }
    },
    [],
  );

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;
      const isInsideAnyWindow = Array.from(elementsRef.current.values()).some(
        (element) => element.contains(target),
      );
      if (!isInsideAnyWindow) setActiveWindowId(null);
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () =>
      document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  return (
    <WindowManagerContext.Provider
      value={{
        activeWindowId,
        openWindows,
        getZIndex,
        registerWindow,
        unregisterWindow,
        focusWindow,
        minimizeWindow,
        registerWindowElement,
      }}
    >
      {children}
    </WindowManagerContext.Provider>
  );
}
