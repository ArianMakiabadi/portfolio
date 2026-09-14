import { createContext } from "react";
import type { WindowStore } from "./windowStore";

// Hands out the WindowStore instance itself, not a plain state object — the
// context value never changes across renders, so Provider re-renders can't
// cascade into consumers. Reactivity comes from useSyncExternalStore instead.
export const WindowManagerContext = createContext<WindowStore | null>(null);
