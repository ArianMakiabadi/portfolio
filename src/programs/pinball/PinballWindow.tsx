import { useEffect, useRef, useState } from "react";
import XPWindow from "../../components/window/Window";
import Pinball from "./Pinball";
import pinballIcon from "../../assets/taskbar/icons/pinball-icon.png";
import type { MenuBarMenu } from "../../types/menuBar";
import type { PinballBridge } from "../../types/pinball";

type PinballWindowProps = {
  onClose: () => void;
};

type PinballFrameWindow = Window & { pinballBridge?: PinballBridge };

function PinballWindow({ onClose }: PinballWindowProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    function handleLoaded() {
      setLoaded(true);
    }

    iframe.addEventListener("game-loaded", handleLoaded);
    iframe.addEventListener("game-load-failed", handleLoaded);
    return () => {
      iframe.removeEventListener("game-loaded", handleLoaded);
      iframe.removeEventListener("game-load-failed", handleLoaded);
    };
  }, []);

  function bridge(): PinballBridge | undefined {
    const contentWindow = iframeRef.current
      ?.contentWindow as PinballFrameWindow | null;
    return contentWindow?.pinballBridge;
  }

  const menus: MenuBarMenu[] = [
    {
      label: "Game",
      items: [
        {
          type: "action",
          label: "New Game",
          onSelect: () => bridge()?.newGame(),
        },
        {
          type: "action",
          label: "Launch Ball",
          onSelect: () => bridge()?.launchBall(),
        },
        {
          type: "action",
          label: "Pause/Resume",
          onSelect: () => bridge()?.pauseOrResume(),
        },
        { type: "separator" },
        { type: "action", label: "Exit", onSelect: () => onClose() },
      ],
    },
    {
      label: "Options",
      items: [
        {
          type: "action",
          label: "Full Screen",
          onSelect: () => bridge()?.toggleFullScreen(),
        },
        {
          type: "action",
          label: "Toggle Audio",
          onSelect: () => bridge()?.toggleAudio(),
        },
      ],
    },
  ];

  return (
    <XPWindow
      id="pinball"
      iconSrc={pinballIcon}
      title="3D Pinball for Windows – Space Cadet"
      resizable={false}
      menus={menus}
      initialSize={{ width: 610, height: 460 }}
      initialPosition={{ x: 200, y: 100 }}
      onClose={onClose}
    >
      <Pinball iframeRef={iframeRef} loaded={loaded} />
    </XPWindow>
  );
}

export default PinballWindow;
