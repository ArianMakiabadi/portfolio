import { useEffect, useState } from "react";
import type { Board } from "../../types/minesweeper";
import MinesweeperCell from "./MinesweeperCell";

type OpenBehavior = { index: number; behavior: "single" | "multi" | null };

type MinesweeperBoardProps = {
  board: Board;
  rows: number;
  columns: number;
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
    // onPreviewSingle/onPreviewChord come from useMinesweeper without stable
    // identity across renders; only the behavior pair should re-trigger this.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openBehavior.index, openBehavior.behavior]);

  useEffect(() => {
    function handleWindowMouseUp() {
      setOpenBehavior({ index: -1, behavior: null });
    }
    window.addEventListener("mouseup", handleWindowMouseUp);
    return () => window.removeEventListener("mouseup", handleWindowMouseUp);
  }, []);

  function handleCellMouseDown(event: React.MouseEvent, index: number) {
    if (event.button === 2 && event.buttons === 2) {
      onCycleFlag(index);
    } else if (event.button === 0 && event.buttons === 1) {
      setOpenBehavior({ index, behavior: "single" });
    } else if (event.buttons === 3) {
      setOpenBehavior({ index, behavior: "multi" });
    }
  }

  function handleCellMouseEnter(index: number) {
    setOpenBehavior((current) => ({ index, behavior: current.behavior }));
  }

  function handleGridMouseUp() {
    const { behavior, index } = openBehavior;
    if (index === -1) return;
    if (behavior === "single") onOpenCell(index);
    else if (behavior === "multi") onChordOpenCell(index);
  }

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
          cell={cell}
          onMouseDown={(event) => handleCellMouseDown(event, index)}
          onMouseEnter={() => handleCellMouseEnter(index)}
        />
      ))}
    </div>
  );
}

export default MinesweeperBoard;
