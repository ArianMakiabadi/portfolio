import Window from "../../components/window/Window";
import Minesweeper from "./Minesweeper";
import minesweeperIcon from "../../assets/taskbar/icons/minesweeper-icon.webp";
import { getMinesweeperWindowSize } from "../../data/minesweeperConfig";
import { useMinesweeper } from "../../hooks/useMinesweeper";
import type { Difficulty } from "../../types/minesweeper";
import type { MenuBarMenu } from "../../types/menuBar";

type MinesweeperWindowProps = {
  onClose: () => void;
};

const DIFFICULTIES: Difficulty[] = ["Beginner", "Intermediate", "Expert"];

function MinesweeperWindow({ onClose }: MinesweeperWindowProps) {
  const minesweeper = useMinesweeper("Beginner");
  const { state, actions } = minesweeper;

  const menus: MenuBarMenu[] = [
    {
      label: "Game",
      items: [
        {
          type: "action",
          label: "New Game",
          onSelect: () => actions.newGame(),
        },
        { type: "separator" },
        ...DIFFICULTIES.map((level) => ({
          type: "checkable" as const,
          label: level,
          checked: state.difficulty === level,
          onSelect: () => actions.newGame(level),
        })),
      ],
    },
    {
      label: "Help",
      items: [
        {
          type: "action",
          label: "How to play?",
          onSelect: () =>
            console.log("TODO: 'How to play?' window not built yet"),
        },
      ],
    },
  ];

  return (
    <Window
      key={state.difficulty}
      id="minesweeper"
      iconSrc={minesweeperIcon}
      title="Minesweeper"
      resizable={false}
      menus={menus}
      initialSize={getMinesweeperWindowSize(state.difficulty)}
      initialPosition={{ x: 220, y: 120 }}
      onClose={onClose}
    >
      <Minesweeper {...minesweeper} />
    </Window>
  );
}

export default MinesweeperWindow;
