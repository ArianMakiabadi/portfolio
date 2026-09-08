import type { WindowSize } from "../types/window";
import type { Difficulty, MinesweeperConfig } from "../types/minesweeper";

export const DIFFICULTY_CONFIG: Record<Difficulty, MinesweeperConfig> = {
  Beginner: { rows: 9, columns: 9, mines: 10 },
  Intermediate: { rows: 16, columns: 16, mines: 40 },
  Expert: { rows: 16, columns: 30, mines: 99 },
};

const CELL_SIZE = 24;

export function getMinesweeperWindowSize(difficulty: Difficulty): WindowSize {
  const { rows, columns } = DIFFICULTY_CONFIG[difficulty];
  return {
    width: columns * CELL_SIZE + 25,
    height: rows * CELL_SIZE + 112,
  };
}
