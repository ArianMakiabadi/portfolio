import startButton from "../assets/taskbar/start-button.webp";
import taskbarBg from "../assets/taskbar/taskbar-bg.webp";
import systemTray from "../assets/taskbar/system-tray.webp";

function Taskbar() {
  const now = new Date();
  const time = now.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <div
      className="relative bg-repeat-x flex items-between"
      style={{ backgroundImage: `url(${taskbarBg})` }}
    >
      <img
        src={startButton}
        alt="start"
        className="absolute left-0 top-0 transition-all duration-150 hover:brightness-110"
      />
      <div className="flex-1" />

      <img src={systemTray} alt="system-tray" className="h-full" />
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-white font-tahoma">
        {time}
      </span>
    </div>
  );
}
export default Taskbar;
