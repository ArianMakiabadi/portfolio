import windowsLogo from "@/assets/logos/windows-logo.webp";

type WelcomeScreenProps = {
  message?: string;
};

function WelcomeScreen({ message }: WelcomeScreenProps) {
  return (
    <div className="welcome-bg-gradient min-h-screen relative">
      {/* Top bar */}
      <div className="absolute top-0 h-28 w-full bg-welcome-header">
        <div className="absolute bottom-0 h-0.5 w-full welcome-top-line" />
      </div>
      {/* Content */}
      <div className="flex items-center justify-center min-h-screen">
        {message ? (
          <div className="flex flex-col items-center">
            <img
              className="h-auto w-56"
              src={windowsLogo}
              alt="Windows"
              draggable="false"
            />
            <p className="mt-4 font-arial text-lg text-white">{message}</p>
          </div>
        ) : (
          <h1 className="translate-x-36 -translate-y-8 font-arial italic text-6xl font-semibold text-white [text-shadow:4px_4px_1px_rgba(20,73,153,0.4)]">
            welcome
          </h1>
        )}
      </div>
      {/* Bottom bar */}
      <div className="absolute bottom-0 h-28 w-full bg-welcome-header">
        <div className="welcome-gold-line h-0.5 w-full" />
      </div>
    </div>
  );
}
export default WelcomeScreen;
