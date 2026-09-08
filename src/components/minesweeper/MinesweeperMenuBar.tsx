import { useEffect, useRef, useState } from "react";
import type { Difficulty } from "../../types/minesweeper";
import checkedSprite from "../../assets/minesweeper/checked.png";

type MenuName = "Game" | "Help";

type MinesweeperMenuBarProps = {
  difficulty: Difficulty;
  onNewGame: () => void;
  onSelectDifficulty: (difficulty: Difficulty) => void;
  onHelp: () => void;
};

const DIFFICULTIES: Difficulty[] = ["Beginner", "Intermediate", "Expert"];

function MinesweeperMenuBar({
  difficulty,
  onNewGame,
  onSelectDifficulty,
  onHelp,
}: MinesweeperMenuBarProps) {
  const [openMenu, setOpenMenu] = useState<MenuName | null>(null);
  const menuBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!openMenu) return;

    function handleWindowMouseDown(event: MouseEvent) {
      if (!menuBarRef.current?.contains(event.target as Node)) {
        setOpenMenu(null);
      }
    }
    window.addEventListener("mousedown", handleWindowMouseDown);
    return () => window.removeEventListener("mousedown", handleWindowMouseDown);
  }, [openMenu]);

  function handleTabMouseDown(menu: MenuName) {
    setOpenMenu((current) => (current === menu ? null : menu));
  }

  function handleTabMouseOver(menu: MenuName) {
    if (openMenu) setOpenMenu(menu);
  }

  function handleRowSelect(action: () => void) {
    action();
    setOpenMenu(null);
  }

  return (
    <div ref={menuBarRef} className="mine-menubar">
      <div
        className="mine-menubar-item pointer"
        onMouseDown={() => handleTabMouseDown("Game")}
        onMouseOver={() => handleTabMouseOver("Game")}
      >
        Game
      </div>
      <div
        className="mine-menubar-item pointer"
        onMouseDown={() => handleTabMouseDown("Help")}
        onMouseOver={() => handleTabMouseOver("Help")}
      >
        Help
      </div>

      {openMenu === "Game" && (
        <div className="mine-dropdown">
          <div
            className="mine-dropdown-row pointer"
            onMouseUp={() => handleRowSelect(onNewGame)}
          >
            <div className="mine-dropdown-check" />
            <span className="mine-dropdown-text">New Game</span>
            <span />
            <span />
          </div>
          <div className="mine-dropdown-separator" />
          {DIFFICULTIES.map((level) => (
            <div
              key={level}
              className="mine-dropdown-row pointer"
              onMouseUp={() => handleRowSelect(() => onSelectDifficulty(level))}
            >
              <div className="mine-dropdown-check">
                {difficulty === level && (
                  <img
                    src={checkedSprite}
                    alt="checked"
                    className="pointer-events-none select-none"
                  />
                )}
              </div>
              <span className="mine-dropdown-text">{level}</span>
              <span />
              <span />
            </div>
          ))}
        </div>
      )}

      {openMenu === "Help" && (
        <div className="mine-dropdown">
          <div
            className="mine-dropdown-row pointer"
            onMouseUp={() => handleRowSelect(onHelp)}
          >
            <div className="mine-dropdown-check" />
            <span className="mine-dropdown-text">How to play?</span>
            <span />
            <span />
          </div>
        </div>
      )}
    </div>
  );
}

export default MinesweeperMenuBar;
