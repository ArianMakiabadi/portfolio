import { useEffect, useRef, useState } from "react";
import XPWindow from "../../components/window/Window";
import Pinball from "./Pinball";
import pinballIcon from "../../assets/taskbar/icons/pinball-icon.png";
import type { MenuBarMenu } from "../../types/menuBar";
import type { PinballBridge } from "../../types/pinball";
import { wait } from "../../utils/wait";

type PinballWindowProps = {
  onClose: () => void;
};

type PinballFrameWindow = Window & {
  pinballBridge?: PinballBridge;
  mute_game_audio?: () => void;
  unmute_game_audio?: () => void;
};

const MIN_LOADING_MS = 3000;

function PinballWindow({ onClose }: PinballWindowProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    let cancelled = false;
    let handleLoaded: () => void;

    const gameLoadedPromise = new Promise<void>((resolve) => {
      handleLoaded = () => {
        // space-cadet.html dispatches "game-loaded" before it finishes wiring up
        // window.mute_game_audio in the same synchronous call, so mute_game_audio
        // isn't defined yet here — defer to a microtask so it runs right after.
        queueMicrotask(() => {
          (
            iframe.contentWindow as PinballFrameWindow | null
          )?.mute_game_audio?.();
        });
        resolve();
      };
      iframe.addEventListener("game-loaded", handleLoaded);
      iframe.addEventListener("game-load-failed", handleLoaded);
    });

    Promise.all([gameLoadedPromise, wait(MIN_LOADING_MS)]).then(() => {
      if (cancelled) return;
      (
        iframe.contentWindow as PinballFrameWindow | null
      )?.unmute_game_audio?.();
      // Give the game canvas real browser focus so the Space bar (launch
      // ball) works immediately, instead of only after a menu action
      // focuses it. Focusing the iframe's window alone isn't enough —
      // the canvas element itself must receive focus.
      iframe.contentDocument?.getElementById("canvas")?.focus();
      setLoaded(true);
    });

    return () => {
      cancelled = true;
      iframe.removeEventListener("game-loaded", handleLoaded);
      iframe.removeEventListener("game-load-failed", handleLoaded);
    };
  }, []);

  useEffect(() => {
    if (loaded) return;
    const root = document.getElementById("root");
    root?.classList.add("progress");
    return () => root?.classList.remove("progress");
  }, [loaded]);

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
      title="3D Pinball – Space Cadet"
      resizable={false}
      menus={menus}
      initialSize={{ width: 610, height: 460 }}
      initialPosition={{ x: 350, y: 150 }}
      onClose={onClose}
    >
      <Pinball iframeRef={iframeRef} loaded={loaded} />
    </XPWindow>
  );
}

export default PinballWindow;
