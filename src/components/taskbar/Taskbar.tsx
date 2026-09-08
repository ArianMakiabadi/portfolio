import { useEffect, useRef, useState } from "react";
import startButton from "../../assets/taskbar/start-button.webp";
import taskbarBg from "../../assets/taskbar/taskbar-bg.webp";
import systemTray from "../../assets/taskbar/system-tray.webp";
import { useWindowManager } from "../../context/useWindowManager";
import StartMenu from "./startmenu/StartMenu";
import TaskbarPellet from "./TaskbarPellet";

type TaskbarProps = {
  onSelectApp: (id: string) => void;
};

function Taskbar({ onSelectApp }: TaskbarProps) {
  const { openWindows, activeWindowId, focusWindow } = useWindowManager();

  const now = new Date();
  const time = now.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);
  const startButtonRef = useRef<HTMLButtonElement>(null);
  const startMenuRef = useRef<HTMLDivElement>(null);
  const taskbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const taskbarElement = taskbarRef.current;
    if (!taskbarElement) return;

    function updateTaskbarHeight() {
      document.documentElement.style.setProperty(
        "--taskbar-height",
        `${taskbarElement!.offsetHeight}px`,
      );
    }

    updateTaskbarHeight();
    const observer = new ResizeObserver(updateTaskbarHeight);
    observer.observe(taskbarElement);
    return () => observer.disconnect();
  }, []);

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

  function handleSelectApp(id: string) {
    closeStartMenu();
    onSelectApp(id);
  }

  return (
    <div
      ref={taskbarRef}
      className="fixed bottom-0 left-0 z-40 w-full bg-repeat-x flex items-center"
      style={{ backgroundImage: `url(${taskbarBg})` }}
    >
      {isStartMenuOpen && (
        <StartMenu
          ref={startMenuRef}
          onSelectApp={handleSelectApp}
          onLogOff={closeStartMenu}
          onShutDown={closeStartMenu}
        />
      )}
      <button
        ref={startButtonRef}
        type="button"
        onClick={() => setIsStartMenuOpen((open) => !open)}
        className="pointer relative shrink-0"
      >
        <img
          src={startButton}
          alt="start"
          className="transition-all duration-150 hover:brightness-110"
        />
      </button>
      <div className="flex h-full flex-1 items-center gap-1 overflow-hidden pl-1">
        {openWindows.map((openWindow) => (
          <TaskbarPellet
            key={openWindow.id}
            title={openWindow.title}
            iconSrc={openWindow.iconSrc}
            isActive={activeWindowId === openWindow.id}
            onClick={() => focusWindow(openWindow.id)}
          />
        ))}
      </div>

      <img src={systemTray} alt="system-tray" className="h-full" />
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-white font-tahoma">
        {time}
      </span>
    </div>
  );
}
export default Taskbar;
