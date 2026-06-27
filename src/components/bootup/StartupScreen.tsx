import LoadingBar from "./LoadingBar";

function StartupScreen() {
  return (
    <main className="startup-screen">
      <img
        className="startup-logo"
        src="src/assets/logos/windows-logo.webp"
        alt="Windows"
        draggable="false"
      />
      <LoadingBar />
    </main>
  );
}

export default StartupScreen;
