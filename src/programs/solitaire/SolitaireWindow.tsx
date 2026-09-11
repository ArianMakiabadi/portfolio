import { useRef, useState } from "react";
import XPWindow from "../../components/window/Window";
import Solitaire from "./Solitaire";
import solitaireIcon from "../../assets/taskbar/icons/solitaire-icon.png";
import type { MenuBarMenu } from "../../types/menuBar";
import type { SolitaireBridge } from "../../types/solitaire";

type SolitaireWindowProps = {
  onClose: () => void;
};

type SolitaireFrameWindow = Window & {
  solitaireBridge?: SolitaireBridge;
};

function SolitaireWindow({ onClose }: SolitaireWindowProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loaded, setLoaded] = useState(false);

  function bridge(): SolitaireBridge | undefined {
    const contentWindow = iframeRef.current
      ?.contentWindow as SolitaireFrameWindow | null;
    return contentWindow?.solitaireBridge;
  }

  const menus: MenuBarMenu[] = [
    {
      label: "Game",
      items: [
        { type: "action", label: "New Game", onSelect: () => bridge()?.deal() },
        { type: "separator" },
        { type: "action", label: "Exit", onSelect: () => onClose() },
      ],
    },
  ];

  return (
    <XPWindow
      id="solitaire"
      iconSrc={solitaireIcon}
      title="Solitaire"
      resizable
      minSize={{ width: 560, height: 480 }}
      menus={menus}
      infoStrip={{ items: ["Drag or double-click a card to move it"] }}
      initialSize={{ width: 720, height: 620 }}
      initialPosition={{ x: 300, y: 100 }}
      onClose={onClose}
    >
      <Solitaire
        iframeRef={iframeRef}
        loaded={loaded}
        onLoad={() => setLoaded(true)}
      />
    </XPWindow>
  );
}

export default SolitaireWindow;
