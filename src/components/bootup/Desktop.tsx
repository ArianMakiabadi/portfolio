import { useCallback, useState } from "react";
import xpBliss from "@/assets/xp-bliss.webp";
import DesktopIcons from "./DesktopIcons";
import PowerDialog, { type PowerDialogMode } from "./PowerDialog";
import Taskbar from "@/components/taskbar/Taskbar";
import MinesweeperWindow from "@/programs/minesweeper/MinesweeperWindow";
import JsPaintWindow from "@/programs/paint/JsPaintWindow";
import PinballWindow from "@/programs/pinball/PinballWindow";
import SolitaireWindow from "@/programs/solitaire/SolitaireWindow";
import ProjectsWindow from "@/components/window/ProjectsWindow";
import { WindowManagerProvider } from "@/context/WindowManagerProvider";

type DesktopProps = {
  onLogOff?: () => void;
  onRestart?: () => void;
};

function Desktop({ onLogOff, onRestart }: DesktopProps) {
  const [powerDialog, setPowerDialog] = useState<PowerDialogMode | null>(null);
  const [openApps, setOpenApps] = useState<Record<string, boolean>>({});

  const openApp = useCallback((id: string) => {
    setOpenApps((prev) => ({ ...prev, [id]: true }));
  }, []);

  const closeApp = useCallback((id: string) => {
    setOpenApps((prev) => ({ ...prev, [id]: false }));
  }, []);

  const closePowerDialog = useCallback(() => setPowerDialog(null), []);
  const openLogOffDialog = useCallback(() => setPowerDialog("logoff"), []);
  const openShutDownDialog = useCallback(() => setPowerDialog("shutdown"), []);

  return (
    <>
      <div
        // Everything behind the power dialog fades to grey; the dialog itself is
        // a sibling so the filter doesn't touch it.
        className={`relative h-screen overflow-hidden bg-cover bg-center bg-no-repeat transition-[filter] ease-in-out ${
          powerDialog
            ? "grayscale brightness-70 delay-500 duration-4000"
            : "duration-300"
        }`}
        style={{ backgroundImage: `url(${xpBliss})` }}
      >
        <DesktopIcons onOpenApp={openApp} />
        <WindowManagerProvider>
          {openApps.minesweeper && (
            <MinesweeperWindow onClose={() => closeApp("minesweeper")} />
          )}
          {openApps.paint && (
            <JsPaintWindow onClose={() => closeApp("paint")} />
          )}
          {openApps.pinball && (
            <PinballWindow onClose={() => closeApp("pinball")} />
          )}
          {openApps.solitaire && (
            <SolitaireWindow onClose={() => closeApp("solitaire")} />
          )}
          {openApps.projects && (
            <ProjectsWindow onClose={() => closeApp("projects")} />
          )}
          <Taskbar
            onSelectApp={openApp}
            onLogOff={openLogOffDialog}
            onShutDown={openShutDownDialog}
          />
        </WindowManagerProvider>
      </div>
      {powerDialog && (
        <PowerDialog
          mode={powerDialog}
          onCancel={closePowerDialog}
          onLogOff={() => onLogOff?.()}
          onRestart={() => onRestart?.()}
        />
      )}
    </>
  );
}
export default Desktop;
