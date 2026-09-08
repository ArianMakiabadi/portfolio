import { useEffect, useRef, useState } from "react";
import { useMinesweeper } from "../../hooks/useMinesweeper";
import type { Difficulty } from "../../types/minesweeper";
import MinesweeperMenuBar from "./MinesweeperMenuBar";
import MinesweeperScorePanel from "./MinesweeperScorePanel";
import MinesweeperBoard from "./MinesweeperBoard";

type MinesweeperProps = {
  initialDifficulty?: Difficulty;
  onDifficultyChange?: (difficulty: Difficulty) => void;
};

function Minesweeper({ initialDifficulty = "Beginner", onDifficultyChange }: MinesweeperProps) {
  const { state, seconds, actions } = useMinesweeper(initialDifficulty);
  const [isPressingBoard, setIsPressingBoard] = useState(false);
  const faceRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    onDifficultyChange?.(state.difficulty);
  }, [state.difficulty, onDifficultyChange]);

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
    state.board.filter((cell) => cell.state === "flag" || cell.state === "misflagged")
      .length;

  return (
    <div
      className="flex h-full w-full flex-col"
      onContextMenu={(event) => event.preventDefault()}
    >
      <MinesweeperMenuBar
        difficulty={state.difficulty}
        onNewGame={() => actions.newGame()}
        onSelectDifficulty={(difficulty) => actions.newGame(difficulty)}
        onHelp={() => console.log("TODO: 'How to play?' window not built yet")}
      />
      <div
        className="mine-content-frame flex flex-1 flex-col"
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
    </div>
  );
}

export default Minesweeper;
