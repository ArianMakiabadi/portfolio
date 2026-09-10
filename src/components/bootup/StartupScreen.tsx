import LoadingBar from "./LoadingBar";
import windowsLogo from "./../../assets/logos/windows-logo.webp";

function StartupScreen() {
  return (
    <main className="startup-screen">
      <img
        className="startup-logo"
        src={windowsLogo}
        alt="Windows"
        draggable="false"
      />
      <LoadingBar />
    </main>
  );
}

export default StartupScreen;
