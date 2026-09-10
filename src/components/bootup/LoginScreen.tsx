import LoginButton from "./LoginButton";
import windowsLogo from "./../../assets/logos/windows-logo.webp";

type LoginScreenProps = {
  onLogin: () => void;
};

function LoginScreen({ onLogin }: LoginScreenProps) {
  return (
    <div className="welcome-bg-gradient min-h-screen relative flex justify-center">
      {/* Top bar */}
      <div className="absolute top-0 h-28 w-full bg-welcome-header">
        <div className="absolute bottom-0 h-0.5 w-full welcome-top-line" />
      </div>
      {/* Content */}
      <div className="flex items-center justify-center h-screen gap-12">
        <div className="flex flex-col justify-center items-end w-105">
          <img
            className="h-auto w-72"
            src={windowsLogo}
            alt="Windows"
            draggable="false"
          />
          <p className="font-arial text-white mt-4 text-2xl pr-2 text-nowrap">
            To begin, click on Arian Makiabadi
          </p>
        </div>
        <div className="welcome-divider h-96 w-px" />
        <div className="w-105">
          <LoginButton onLogin={onLogin} />
        </div>
      </div>
      {/* Bottom bar */}
      <div className="absolute bottom-0 h-28 w-full bg-welcome-header">
        <div className="welcome-gold-line h-0.5 w-full" />
        <div className="flex justify-end p-8">
          <div className="flex flex-col">
            <p className="font-tahoma text-white text-sm ">
              There's plenty to discover once you're logged in.
            </p>
            <p className="font-tahoma text-white text-sm ">
              Every pixel has a purpose.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
export default LoginScreen;
