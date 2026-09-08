import { useEffect, useReducer, useState } from "react";
import { DIFFICULTY_CONFIG } from "../data/minesweeperConfig";
import type {
  Board,
  CellState,
  Difficulty,
  GameStatus,
  MinesweeperState,
} from "../types/minesweeper";

type Action =
  | { type: "CLEAR_MAP"; payload?: Difficulty }
  | { type: "START_GAME"; payload: number }
  | { type: "OPEN_CEIL"; payload: number }
  | { type: "CHANGE_CEIL_STATE"; payload: number }
  | { type: "GAME_OVER"; payload: number }
  | { type: "WON" }
  | { type: "OPENING_CEIL"; payload: number }
  | { type: "OPENING_CEILS"; payload: number };

function createBoard(rows: number, columns: number): Board {
  return Array.from({ length: rows * columns }, () => ({
    state: "cover",
    minesAround: 0,
    opening: false,
  }));
}

function getInitState(difficulty: Difficulty): MinesweeperState {
  const { rows, columns, mines } = DIFFICULTY_CONFIG[difficulty];
  return {
    difficulty,
    status: "new",
    rows,
    columns,
    mines,
    board: createBoard(rows, columns),
  };
}

function getNearIndexes(index: number, rows: number, columns: number): number[] {
  if (index < 0 || index >= rows * columns) return [];
  const row = Math.floor(index / columns);
  const column = index % columns;
  return [
    index - columns - 1,
    index - columns,
    index - columns + 1,
    index - 1,
    index + 1,
    index + columns - 1,
    index + columns,
    index + columns + 1,
  ].filter((_, arrayIndex) => {
    if (row === 0 && arrayIndex < 3) return false;
    if (row === rows - 1 && arrayIndex > 4) return false;
    if (column === 0 && [0, 3, 5].includes(arrayIndex)) return false;
    if (column === columns - 1 && [2, 4, 7].includes(arrayIndex)) return false;
    return true;
  });
}

function pickRandomIndexes(candidates: number[], count: number): number[] {
  const pool = [...candidates];
  const picked: number[] = [];
  for (let i = 0; i < count && pool.length > 0; i++) {
    const randomIndex = Math.floor(Math.random() * pool.length);
    picked.push(pool[randomIndex]);
    pool[randomIndex] = pool[pool.length - 1];
    pool.pop();
  }
  return picked;
}

function insertMines(state: MinesweeperState, exclude: number): Board {
  const { rows, columns, mines, board } = state;
  const nextBoard = board.map((cell) => ({ ...cell }));
  const candidates = Array.from({ length: rows * columns }, (_, i) => i).filter(
    (i) => i !== exclude,
  );
  pickRandomIndexes(candidates, mines).forEach((minedIndex) => {
    nextBoard[minedIndex].minesAround = -10;
    getNearIndexes(minedIndex, rows, columns).forEach((nearIndex) => {
      nextBoard[nearIndex].minesAround += 1;
    });
  });
  return nextBoard;
}

function floodFillIndexes(state: MinesweeperState, index: number): number[] {
  const { rows, columns, board } = state;
  const visited = new Array(board.length).fill(false);
  const result: number[] = [];
  function walk(current: number) {
    const cell = board[current];
    if (visited[current] || cell.minesAround < 0 || cell.state === "flag") return;
    visited[current] = true;
    result.push(current);
    if (cell.minesAround > 0) return;
    getNearIndexes(current, rows, columns).forEach(walk);
  }
  walk(index);
  return result;
}

const NEXT_FLAG_CYCLE_STATE: Partial<Record<CellState, CellState>> = {
  cover: "flag",
  flag: "unknown",
  unknown: "cover",
};

function reducer(state: MinesweeperState, action: Action): MinesweeperState {
  switch (action.type) {
    case "CLEAR_MAP":
      return getInitState(action.payload ?? state.difficulty);

    case "START_GAME":
      return {
        ...state,
        board: insertMines(state, action.payload),
        status: "started",
      };

    case "OPEN_CEIL": {
      const indexes = floodFillIndexes(state, action.payload);
      const board = [...state.board];
      indexes.forEach((i) => {
        board[i] = { ...board[i], state: "open" };
      });
      return { ...state, board };
    }

    case "CHANGE_CEIL_STATE": {
      const index = action.payload;
      const cell = state.board[index];
      const nextState = NEXT_FLAG_CYCLE_STATE[cell.state];
      if (!nextState) return state;
      const board = [...state.board];
      board[index] = { ...cell, state: nextState };
      return { ...state, board };
    }

    case "GAME_OVER": {
      const board: Board = state.board.map((cell) => {
        if (cell.minesAround < 0 && cell.state !== "flag") {
          return { ...cell, state: "mine" };
        }
        if (cell.state === "flag" && cell.minesAround >= 0) {
          return { ...cell, state: "misflagged" };
        }
        return { ...cell, opening: false };
      });
      board[action.payload] = { ...board[action.payload], state: "die" };
      return { ...state, status: "died", board };
    }

    case "WON": {
      const board: Board = state.board.map((cell) =>
        cell.minesAround >= 0
          ? { ...cell, state: "open" }
          : { ...cell, state: "flag" },
      );
      return { ...state, status: "won", board };
    }

    case "OPENING_CEIL": {
      const board = state.board.map((cell) => ({ ...cell, opening: false }));
      if (action.payload >= 0) {
        board[action.payload] = { ...board[action.payload], opening: true };
      }
      return { ...state, board };
    }

    case "OPENING_CEILS": {
      const indexes = getNearIndexes(action.payload, state.rows, state.columns);
      const board = state.board.map((cell) => ({ ...cell, opening: false }));
      [...indexes, action.payload].forEach((i) => {
        board[i] = { ...board[i], opening: true };
      });
      return { ...state, board };
    }

    default:
      return state;
  }
}

function useTimer(status: GameStatus) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (status !== "started") return;

    const timer = setInterval(() => setSeconds((current) => current + 1), 1000);
    return () => clearInterval(timer);
  }, [status]);

  return [seconds, setSeconds] as const;
}

export function useMinesweeper(initialDifficulty: Difficulty = "Beginner") {
  const [state, dispatch] = useReducer(reducer, getInitState(initialDifficulty));
  const [seconds, setSeconds] = useTimer(state.status);

  useEffect(() => {
    if (state.status !== "started") return;
    const remaining = state.board.filter(
      (cell) => cell.state !== "open" && cell.minesAround >= 0,
    ).length;
    if (remaining === 0) dispatch({ type: "WON" });
  });

  function openCell(index: number) {
    switch (state.status) {
      case "new":
        dispatch({ type: "START_GAME", payload: index });
        dispatch({ type: "OPEN_CEIL", payload: index });
        break;
      case "started": {
        const cell = state.board[index];
        if (cell.state === "flag" || cell.state === "open") return;
        if (cell.minesAround < 0) {
          dispatch({ type: "GAME_OVER", payload: index });
        } else {
          dispatch({ type: "OPEN_CEIL", payload: index });
        }
        break;
      }
      default:
        break;
    }
  }

  function chordOpenCell(index: number) {
    const cell = state.board[index];
    if (cell.state !== "open" || cell.minesAround <= 0 || state.status !== "started") {
      return;
    }
    const indexes = getNearIndexes(index, state.rows, state.columns);
    const flaggedCount = indexes.filter((i) => state.board[i].state === "flag").length;
    if (flaggedCount !== cell.minesAround) return;

    const mineIndex = indexes.find(
      (i) => state.board[i].minesAround < 0 && state.board[i].state !== "flag",
    );
    if (mineIndex !== undefined) {
      dispatch({ type: "GAME_OVER", payload: mineIndex });
    } else {
      indexes.forEach((i) => dispatch({ type: "OPEN_CEIL", payload: i }));
    }
  }

  function cycleCellFlag(index: number) {
    const cell = state.board[index];
    if (cell.state === "open" || state.status === "won" || state.status === "died") {
      return;
    }
    dispatch({ type: "CHANGE_CEIL_STATE", payload: index });
  }

  function newGame(difficulty?: Difficulty) {
    dispatch({ type: "CLEAR_MAP", payload: difficulty });
    setSeconds(0);
  }

  function previewSingle(index: number) {
    if (state.status === "won" || state.status === "died") return;
    dispatch({ type: "OPENING_CEIL", payload: index });
  }

  function previewChord(index: number) {
    if (state.status === "won" || state.status === "died") return;
    dispatch({ type: "OPENING_CEILS", payload: index });
  }

  return {
    state,
    seconds,
    actions: {
      openCell,
      chordOpenCell,
      cycleCellFlag,
      newGame,
      previewSingle,
      previewChord,
    },
  };
}
