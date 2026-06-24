function WelcomeScreen() {
  return (
    <div className="welcome-bg-gradient min-h-screen relative">
      {/* Top bar */}
      <div className="absolute top-0 h-28 w-full bg-welcome-header">
        <div className="absolute bottom-0 h-0.5 w-full welcome-top-line" />
      </div>
      {/* Content */}
      <div className="flex items-center justify-center min-h-screen">
        <h1 className="translate-x-36 -translate-y-8 font-arial italic text-6xl font-semibold text-white [text-shadow:4px_4px_1px_rgba(20,73,153,0.4)]">
          welcome
        </h1>
      </div>
      {/* Bottom bar */}
      <div className="absolute bottom-0 h-28 w-full bg-welcome-header">
        <div className="welcome-gold-line h-0.5 w-full" />
      </div>
    </div>
  );
}
export default WelcomeScreen;
