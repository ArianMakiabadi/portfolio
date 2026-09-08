export type Difficulty = "Beginner" | "Intermediate" | "Expert";

export type GameStatus = "new" | "started" | "died" | "won";

export type CellState =
  | "cover"
  | "flag"
  | "unknown"
  | "open"
  | "die"
  | "misflagged"
  | "mine";

export type Cell = {
  state: CellState;
  minesAround: number;
  opening: boolean;
};

export type Board = Cell[];

export type MinesweeperConfig = {
  rows: number;
  columns: number;
  mines: number;
};

export type MinesweeperState = {
  difficulty: Difficulty;
  status: GameStatus;
  rows: number;
  columns: number;
  mines: number;
  board: Board;
};
