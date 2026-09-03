import xpBliss from "../../assets/xp-bliss.webp";
import Taskbar from "../Taskbar";

function Desktop() {
  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${xpBliss})` }}
    >
      <Taskbar />
    </div>
  );
}
export default Desktop;
