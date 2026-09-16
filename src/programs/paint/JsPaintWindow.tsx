import { useEffect, useRef, useState } from "react";
import XPWindow, { type WindowHandle } from "../../components/window/Window";
import JsPaint from "./JsPaint";
import paintIcon from "../../assets/taskbar/icons/paint.webp";
import type { MenuBarMenu } from "../../types/menuBar";
import { useProgressCursor } from "../../hooks/useProgressCursor";
import { useWindowManager } from "../../context/useWindowManager";

const WINDOW_ID = "paint";
// jspaint's own About dialog (hidden, but still eagerly requested per the
// <img> loading spec) hotlinks screenshots from github.com/postimg.cc. If
// one of those stalls, the iframe's native `load` event never fires, so
// this bounds how long we wait on it before showing the app anyway.
const LOAD_FALLBACK_MS = 4000;

type JsPaintWindowProps = {
  onClose: () => void;
};

function JsPaintWindow({ onClose }: JsPaintWindowProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const windowRef = useRef<WindowHandle>(null);
  const [loaded, setLoaded] = useState(false);
  const { minimizeWindow } = useWindowManager();

  useProgressCursor(!loaded);

  useEffect(() => {
    const timeoutId = window.setTimeout(
      () => setLoaded(true),
      LOAD_FALLBACK_MS,
    );
    return () => window.clearTimeout(timeoutId);
  }, []);

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
      minSize={{ width: 920, height: 580 }}
      menus={menus}
      initialSize={{ width: 920, height: 580 }}
      initialPosition={{ x: 460, y: 180 }}
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
