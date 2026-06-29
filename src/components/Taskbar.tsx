import startButton from "../assets/taskbar/start-button.webp";
import taskbarBg from "../assets/taskbar/taskbar-bg.webp";
import systemTray from "../assets/taskbar/system-tray.webp";

function Taskbar() {
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
    </div>
  );
}
export default Taskbar;
