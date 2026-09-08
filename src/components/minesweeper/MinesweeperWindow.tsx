import { useState } from "react";
import Window from "../window/Window";
import Minesweeper from "./Minesweeper";
import minesweeperIcon from "../../assets/taskbar/icons/minesweeper-icon.webp";
import { getMinesweeperWindowSize } from "../../data/minesweeperConfig";
import type { Difficulty } from "../../types/minesweeper";

type MinesweeperWindowProps = {
  onClose: () => void;
};

function MinesweeperWindow({ onClose }: MinesweeperWindowProps) {
  const [difficulty, setDifficulty] = useState<Difficulty>("Beginner");

  return (
    <Window
      key={difficulty}
      id="minesweeper"
      iconSrc={minesweeperIcon}
      title="Minesweeper"
      resizable={false}
      initialSize={getMinesweeperWindowSize(difficulty)}
      initialPosition={{ x: 220, y: 120 }}
      onClose={onClose}
    >
      <Minesweeper initialDifficulty={difficulty} onDifficultyChange={setDifficulty} />
    </Window>
  );
}

export default MinesweeperWindow;
