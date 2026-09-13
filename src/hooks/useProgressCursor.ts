import { useEffect } from "react";

export function useProgressCursor(isLoading: boolean): void {
  useEffect(() => {
    if (!isLoading) return;
    const root = document.getElementById("root");
    root?.classList.add("progress");
    return () => root?.classList.remove("progress");
  }, [isLoading]);
}
