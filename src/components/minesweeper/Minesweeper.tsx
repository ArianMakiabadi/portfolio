import { useEffect, useRef, useState } from "react";
import type { useMinesweeper } from "../../hooks/useMinesweeper";
import MinesweeperScorePanel from "./MinesweeperScorePanel";
import MinesweeperBoard from "./MinesweeperBoard";

type MinesweeperProps = ReturnType<typeof useMinesweeper>;

function Minesweeper({ state, seconds, actions }: MinesweeperProps) {
  const [isPressingBoard, setIsPressingBoard] = useState(false);
  const faceRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handleWindowMouseUp() {
      setIsPressingBoard(false);
    }
    window.addEventListener("mouseup", handleWindowMouseUp);
    return () => window.removeEventListener("mouseup", handleWindowMouseUp);
  }, []);

  function handleContentMouseDown(event: React.MouseEvent) {
    if (event.button !== 0) return;
    if (state.status === "won" || state.status === "died") return;
    if (faceRef.current?.contains(event.target as Node)) return;
    setIsPressingBoard(true);
  }

  const minesRemaining =
    state.mines -
    state.board.filter(
      (cell) => cell.state === "flag" || cell.state === "misflagged",
    ).length;

  return (
    <div
      className="mine-content-frame flex h-full w-full flex-col"
      onContextMenu={(event) => event.preventDefault()}
      onMouseDown={handleContentMouseDown}
    >
      <MinesweeperScorePanel
        minesRemaining={minesRemaining}
        seconds={seconds}
        status={state.status}
        isPressingBoard={isPressingBoard}
        onFaceClick={() => actions.newGame(state.difficulty)}
        faceRef={faceRef}
      />
      <MinesweeperBoard
        board={state.board}
        rows={state.rows}
        columns={state.columns}
        onOpenCell={actions.openCell}
        onChordOpenCell={actions.chordOpenCell}
        onCycleFlag={actions.cycleCellFlag}
        onPreviewSingle={actions.previewSingle}
        onPreviewChord={actions.previewChord}
      />
    </div>
  );
}

export default Minesweeper;
