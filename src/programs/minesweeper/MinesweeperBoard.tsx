import { useCallback, useEffect, useState } from "react";
import type { Board } from "../../types/minesweeper";
import MinesweeperCell from "./MinesweeperCell";

type OpenBehavior = { index: number; behavior: "single" | "multi" | null };

type MinesweeperBoardProps = {
  board: Board;
  rows: number;
  columns: number;
  openingIndexes: number[];
  onOpenCell: (index: number) => void;
  onChordOpenCell: (index: number) => void;
  onCycleFlag: (index: number) => void;
  onPreviewSingle: (index: number) => void;
  onPreviewChord: (index: number) => void;
};

function MinesweeperBoard({
  board,
  rows,
  columns,
  openingIndexes,
  onOpenCell,
  onChordOpenCell,
  onCycleFlag,
  onPreviewSingle,
  onPreviewChord,
}: MinesweeperBoardProps) {
  const [openBehavior, setOpenBehavior] = useState<OpenBehavior>({
    index: -1,
    behavior: null,
  });

  useEffect(() => {
    if (openBehavior.behavior === "single") onPreviewSingle(openBehavior.index);
    else if (openBehavior.behavior === "multi")
      onPreviewChord(openBehavior.index);
    else onPreviewSingle(-1);
  }, [
    openBehavior.index,
    openBehavior.behavior,
    onPreviewSingle,
    onPreviewChord,
  ]);

  useEffect(() => {
    function handleWindowMouseUp() {
      setOpenBehavior({ index: -1, behavior: null });
    }
    window.addEventListener("mouseup", handleWindowMouseUp);
    return () => window.removeEventListener("mouseup", handleWindowMouseUp);
  }, []);

  const handleCellMouseDown = useCallback(
    (event: React.MouseEvent, index: number) => {
      if (event.button === 2 && event.buttons === 2) {
        onCycleFlag(index);
      } else if (event.button === 0 && event.buttons === 1) {
        setOpenBehavior({ index, behavior: "single" });
      } else if (event.buttons === 3) {
        setOpenBehavior({ index, behavior: "multi" });
      }
    },
    [onCycleFlag],
  );

  const handleCellMouseEnter = useCallback((index: number) => {
    setOpenBehavior((current) => ({ index, behavior: current.behavior }));
  }, []);

  function handleGridMouseUp() {
    const { behavior, index } = openBehavior;
    if (index === -1) return;
    if (behavior === "single") onOpenCell(index);
    else if (behavior === "multi") onChordOpenCell(index);
  }

  const openingSet = new Set(openingIndexes);

  return (
    <div
      className="mine-board-frame"
      style={{
        gridTemplateColumns: `repeat(${columns}, 24px)`,
        gridTemplateRows: `repeat(${rows}, 24px)`,
      }}
      onMouseUp={handleGridMouseUp}
    >
      {board.map((cell, index) => (
        <MinesweeperCell
          key={index}
          index={index}
          cell={cell}
          opening={openingSet.has(index)}
          onMouseDown={handleCellMouseDown}
          onMouseEnter={handleCellMouseEnter}
        />
      ))}
    </div>
  );
}

export default MinesweeperBoard;
