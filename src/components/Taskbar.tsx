import { useEffect, useRef, useState } from "react";
import startButton from "../assets/taskbar/start-button.webp";
import taskbarBg from "../assets/taskbar/taskbar-bg.webp";
import systemTray from "../assets/taskbar/system-tray.webp";
import StartMenu from "./startmenu/StartMenu";

function Taskbar() {
  const now = new Date();
  const time = now.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);
  const startButtonRef = useRef<HTMLButtonElement>(null);
  const startMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isStartMenuOpen) return;

    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        startMenuRef.current?.contains(target) ||
        startButtonRef.current?.contains(target)
      ) {
        return;
      }
      setIsStartMenuOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isStartMenuOpen]);

  function closeStartMenu() {
    setIsStartMenuOpen(false);
  }

  return (
    <div
      className="fixed bottom-0 left-0 z-40 w-full bg-repeat-x flex items-between"
      style={{ backgroundImage: `url(${taskbarBg})` }}
    >
      {isStartMenuOpen && (
        <StartMenu
          ref={startMenuRef}
          onSelectApp={closeStartMenu}
          onLogOff={closeStartMenu}
          onShutDown={closeStartMenu}
        />
      )}
      <button
        ref={startButtonRef}
        type="button"
        onClick={() => setIsStartMenuOpen((open) => !open)}
        className="pointer absolute left-0 top-0"
      >
        <img
          src={startButton}
          alt="start"
          className="transition-all duration-150 hover:brightness-110"
        />
      </button>
      <div className="flex-1" />

      <img src={systemTray} alt="system-tray" className="h-full" />
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-white font-tahoma">
        {time}
      </span>
    </div>
  );
}
export default Taskbar;
