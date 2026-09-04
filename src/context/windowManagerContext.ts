import { createContext } from "react";

export type OpenWindow = {
  id: string;
  title: string;
  iconSrc: string;
  isMinimized: boolean;
};

export type WindowManagerContextValue = {
  activeWindowId: string | null;
  openWindows: OpenWindow[];
  getZIndex: (id: string) => number;
  registerWindow: (id: string, meta: { title: string; iconSrc: string }) => void;
  unregisterWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  registerWindowElement: (id: string, element: HTMLElement | null) => void;
};

export const WindowManagerContext =
  createContext<WindowManagerContextValue | null>(null);
