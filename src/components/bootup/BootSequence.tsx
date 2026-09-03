import { useEffect, useState } from "react";
import BlackScreen from "./BlackScreen";
import StartupScreen from "./StartupScreen";
import WelcomeScreen from "./WelcomeScreen";
import LoginScreen from "./LoginScreen";
import Desktop from "./Desktop";
import startupSound from "../../assets/sounds/start-windows.mp3";
import { playSound } from "../../utils/audio";
import { wait } from "../../utils/wait";

type Stage =
  | "black-1"
  | "startup"
  | "black-2"
  | "welcome"
  | "login"
  | "desktop";

function BootSequence() {
  const [stage, setStage] = useState<Stage>("black-1");
  const audio = new Audio(startupSound);

  useEffect(() => {
    async function run() {
      await wait(1000);
      setStage("startup");

      await wait(7000);
      setStage("black-2");

      await wait(1000);
      setStage("welcome");

      await wait(2000);
      setStage("login");
    }

    run();
  }, []);

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
            playSound(audio);
          }}
        />
      );

    case "desktop":
      return <Desktop />;

    default:
      return <Desktop />;
  }
}
export default BootSequence;
