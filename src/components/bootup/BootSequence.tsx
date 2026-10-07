import { useCallback, useEffect, useRef, useState } from "react";
import BlackScreen from "./BlackScreen";
import StartupScreen from "./StartupScreen";
import WelcomeScreen from "./WelcomeScreen";
import LoginScreen from "./LoginScreen";
import ShutdownScreen from "./ShutdownScreen";
import Desktop from "./Desktop";
import startupSound from "@/assets/sounds/start-windows.mp3";
import shutdownSound from "@/assets/sounds/shutdown-windows.mp3";
import { playSound } from "@/utils/audio";
import { wait } from "@/utils/wait";
import { preloadImages } from "@/utils/preloadImages";
import { BOOT_PRELOAD_ASSET_URLS } from "./bootupAssets";

type Stage =
  | "black-1"
  | "startup"
  | "black-2"
  | "welcome"
  | "login"
  | "desktop"
  | "logging-off"
  | "shutting-down";

function BootSequence() {
  const [stage, setStage] = useState<Stage>("black-1");
  const audioRef = useRef(new Audio(startupSound));
  const shutdownAudioRef = useRef(new Audio(shutdownSound));
  // Bumped whenever a timeline is superseded (unmount, log off, restart) so a
  // stale one stops advancing the stage after its next wait.
  const runIdRef = useRef(0);

  useEffect(() => {
    preloadImages(BOOT_PRELOAD_ASSET_URLS);
  }, []);

  // Expects the stage to already be "black-1".
  const runBoot = useCallback(async () => {
    const runId = ++runIdRef.current;
    const isStale = () => runId !== runIdRef.current;

    await wait(1000);
    if (isStale()) return;
    setStage("startup");

    await wait(7000);
    if (isStale()) return;
    setStage("black-2");

    await wait(1000);
    if (isStale()) return;
    setStage("welcome");

    await wait(2000);
    if (isStale()) return;
    setStage("login");
  }, []);

  useEffect(() => {
    const runIds = runIdRef;
    void runBoot();
    return () => {
      runIds.current++;
    };
  }, [runBoot]);

  const handleLogOff = useCallback(() => {
    runIdRef.current++;
    setStage("login");
  }, []);

  const handleRestart = useCallback(async () => {
    const runId = ++runIdRef.current;
    const isStale = () => runId !== runIdRef.current;

    setStage("logging-off");
    playSound(shutdownAudioRef.current);

    await wait(2000);
    if (isStale()) return;
    setStage("shutting-down");

    await wait(2500);
    if (isStale()) return;
    setStage("black-1");
    void runBoot();
  }, [runBoot]);

  switch (stage) {
    case "black-1":
    case "black-2":
      return <BlackScreen />;

    case "startup":
      return <StartupScreen />;

    case "welcome":
      return <WelcomeScreen />;

    case "login":
      return (
        <LoginScreen
          onLogin={() => {
            setStage("desktop");
            playSound(audioRef.current);
          }}
        />
      );

    case "logging-off":
    case "shutting-down":
      return <ShutdownScreen phase={stage} />;

    case "desktop":
      return <Desktop onLogOff={handleLogOff} onRestart={handleRestart} />;

    default:
      return <Desktop />;
  }
}
export default BootSequence;
