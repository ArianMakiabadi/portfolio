import { useState } from "react";
import xpBliss from "../../assets/xp-bliss.webp";
import Taskbar from "../taskbar/Taskbar";
import MinesweeperWindow from "../minesweeper/MinesweeperWindow";
import { WindowManagerProvider } from "../../context/WindowManagerProvider";

function Desktop() {
  const [openApps, setOpenApps] = useState<Record<string, boolean>>({});

  function openApp(id: string) {
    setOpenApps((prev) => ({ ...prev, [id]: true }));
  }

  function closeApp(id: string) {
    setOpenApps((prev) => ({ ...prev, [id]: false }));
  }

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${xpBliss})` }}
    >
      <WindowManagerProvider>
        {openApps.minesweeper && (
          <MinesweeperWindow onClose={() => closeApp("minesweeper")} />
        )}
        <Taskbar onSelectApp={openApp} />
      </WindowManagerProvider>
    </div>
  );
}
export default Desktop;
