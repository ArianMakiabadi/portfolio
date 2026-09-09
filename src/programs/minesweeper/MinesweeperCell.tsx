import type { Cell } from "../../types/minesweeper";
import flagSprite from "../../assets/minesweeper/flag.png";
import questionSprite from "../../assets/minesweeper/question.png";
import mineSprite from "../../assets/minesweeper/mine-ceil.png";
import mineDeathSprite from "../../assets/minesweeper/mine-death.png";
import misflaggedSprite from "../../assets/minesweeper/misflagged.png";
import { NUMBER_SPRITES } from "./minesweeperSprites";

type MinesweeperCellProps = {
  cell: Cell;
  onMouseDown: (event: React.MouseEvent) => void;
  onMouseEnter: () => void;
};

function CellBackground({ sunken }: { sunken: boolean }) {
  return <div className={sunken ? "mine-cell-open" : "mine-cell-cover"} />;
}

function MinesweeperCell({
  cell,
  onMouseDown,
  onMouseEnter,
}: MinesweeperCellProps) {
  const { state, minesAround, opening } = cell;

  function renderContent() {
    switch (state) {
      case "open":
        return (
          <>
            <CellBackground sunken />
            <img
              src={NUMBER_SPRITES[minesAround]}
              alt={String(minesAround)}
              className="pointer-events-none absolute inset-0 h-6 w-6 select-none"
            />
          </>
        );
      case "flag":
        return (
          <>
            <CellBackground sunken={false} />
            <img
              src={flagSprite}
              alt="flag"
              className="pointer-events-none absolute inset-0 h-6 w-6 select-none"
            />
          </>
        );
      case "misflagged":
        return (
          <>
            <CellBackground sunken />
            <img
              src={misflaggedSprite}
              alt="misflagged"
              className="pointer-events-none absolute inset-0 h-6 w-6 select-none"
            />
          </>
        );
      case "mine":
        return (
          <>
            <CellBackground sunken />
            <img
              src={mineSprite}
              alt="mine"
              className="pointer-events-none absolute inset-0 h-6 w-6 select-none"
            />
          </>
        );
      case "die":
        return (
          <>
            <CellBackground sunken />
            <img
              src={mineDeathSprite}
              alt="mine"
              className="pointer-events-none absolute inset-0 h-6 w-6 select-none"
            />
          </>
        );
      case "unknown":
        return (
          <>
            <CellBackground sunken={opening} />
            <img
              src={questionSprite}
              alt="question"
              className="pointer-events-none absolute inset-0 h-6 w-6 select-none"
            />
          </>
        );
      default:
        return <CellBackground sunken={opening} />;
    }
  }

  return (
    <div
      className="relative h-6 w-6"
      onMouseDown={onMouseDown}
      onMouseEnter={onMouseEnter}
    >
      {renderContent()}
    </div>
  );
}

export default MinesweeperCell;
