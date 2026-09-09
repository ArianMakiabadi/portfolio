import type { RefObject } from "react";
import type { GameStatus } from "../../types/minesweeper";
import MinesweeperDigitDisplay from "./MinesweeperDigitDisplay";
import smileSprite from "../../assets/minesweeper/smile.png";
import ohhSprite from "../../assets/minesweeper/ohh.png";
import deadSprite from "../../assets/minesweeper/dead.png";
import winSprite from "../../assets/minesweeper/win.png";

type MinesweeperScorePanelProps = {
  minesRemaining: number;
  seconds: number;
  status: GameStatus;
  isPressingBoard: boolean;
  onFaceClick: () => void;
  faceRef: RefObject<HTMLButtonElement | null>;
};

function getFaceSprite(status: GameStatus, isPressingBoard: boolean) {
  if (isPressingBoard) return ohhSprite;
  if (status === "died") return deadSprite;
  if (status === "won") return winSprite;
  return smileSprite;
}

function MinesweeperScorePanel({
  minesRemaining,
  seconds,
  status,
  isPressingBoard,
  onFaceClick,
  faceRef,
}: MinesweeperScorePanelProps) {
  return (
    <div className="mine-score-panel">
      <MinesweeperDigitDisplay value={minesRemaining} />
      <div className="mine-face-outer">
        <button
          ref={faceRef}
          type="button"
          className="mine-face-button pointer"
          onClick={onFaceClick}
        >
          <img
            src={getFaceSprite(status, isPressingBoard)}
            alt={status}
            className="pointer-events-none h-full w-full select-none"
          />
        </button>
      </div>
      <MinesweeperDigitDisplay value={seconds} />
    </div>
  );
}

export default MinesweeperScorePanel;
