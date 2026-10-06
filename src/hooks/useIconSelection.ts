import { useCallback, useMemo, useState } from "react";
import type { MouseEvent } from "react";

export type IconSelection = {
  selectedId: string | null;
  select: (id: string) => void;
  containerProps: {
    onMouseDown: (event: MouseEvent<HTMLElement>) => void;
  };
};

// Single-selection state for a group of `IconItem`s. Spread `containerProps`
// on the element wrapping the items so a press on its empty area deselects.
export function useIconSelection(): IconSelection {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleContainerMouseDown = useCallback(
    (event: MouseEvent<HTMLElement>) => {
      if (!(event.target as HTMLElement).closest("[data-icon-item]")) {
        setSelectedId(null);
      }
    },
    [],
  );

  return useMemo(
    () => ({
      selectedId,
      select: setSelectedId,
      containerProps: { onMouseDown: handleContainerMouseDown },
    }),
    [selectedId, handleContainerMouseDown],
  );
}
