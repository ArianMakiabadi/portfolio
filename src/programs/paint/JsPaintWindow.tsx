import { useRef, useState } from "react";
import XPWindow, { type WindowHandle } from "../../components/window/Window";
import JsPaint from "./JsPaint";
import paintIcon from "../../assets/taskbar/icons/paint.webp";
import type { MenuBarMenu } from "../../types/menuBar";
import { useProgressCursor } from "../../hooks/useProgressCursor";
import { useWindowManager } from "../../context/useWindowManager";

const WINDOW_ID = "paint";

type JsPaintWindowProps = {
  onClose: () => void;
};

function JsPaintWindow({ onClose }: JsPaintWindowProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const windowRef = useRef<WindowHandle>(null);
  const [loaded, setLoaded] = useState(false);
  const { minimizeWindow } = useWindowManager();

  useProgressCursor(!loaded);

  const menus: MenuBarMenu[] = [
    {
      label: "File",
      items: [
        { type: "action", label: "New...", onSelect: () => {}, disabled: true },
        { type: "action", label: "Save", onSelect: () => {}, disabled: true },
        { type: "action", label: "Print", onSelect: () => {}, disabled: true },
        { type: "separator" },
        { type: "action", label: "Exit", onSelect: () => onClose() },
      ],
    },
    {
      label: "View",
      items: [
        {
          type: "action",
          label: "Maximize",
          onSelect: () => windowRef.current?.toggleMaximize(),
        },
        {
          type: "action",
          label: "Minimize",
          onSelect: () => minimizeWindow(WINDOW_ID),
        },
      ],
    },
  ];

  return (
    <XPWindow
      ref={windowRef}
      id={WINDOW_ID}
      iconSrc={paintIcon}
      title="Paint"
      resizable
      minSize={{ width: 400, height: 320 }}
      menus={menus}
      initialSize={{ width: 500, height: 420 }}
      initialPosition={{ x: 260, y: 80 }}
      onClose={onClose}
    >
      <JsPaint
        iframeRef={iframeRef}
        loaded={loaded}
        onLoad={() => setLoaded(true)}
      />
    </XPWindow>
  );
}

export default JsPaintWindow;
