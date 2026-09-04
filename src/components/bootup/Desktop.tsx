import xpBliss from "../../assets/xp-bliss.webp";
import noteIcon from "../../assets/taskbar/icons/note.webp";
import Taskbar from "../taskbar/Taskbar";
import Window from "../window/Window";
import { WindowManagerProvider } from "../../context/WindowManagerProvider";

function Desktop() {
  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${xpBliss})` }}
    >
      <WindowManagerProvider>
        <Window
          id="test"
          iconSrc={noteIcon}
          title="test"
          initialSize={{ width: 300, height: 300 }}
          initialPosition={{ x: 200, y: 400 }}
        >
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Laudantium
            eligendi nisi tempora laboriosam deleniti voluptatum quos.
            Blanditiis laboriosam magnam ipsa?
          </p>
        </Window>
        <Taskbar />
      </WindowManagerProvider>
    </div>
  );
}
export default Desktop;
