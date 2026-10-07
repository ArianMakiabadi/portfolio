import SessionScreenLayout from "./SessionScreenLayout";
import windowsLogo from "@/assets/logos/windows-logo.webp";

type WelcomeScreenProps = {
  message?: string;
};

function WelcomeScreen({ message }: WelcomeScreenProps) {
  return (
    <SessionScreenLayout>
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
    </SessionScreenLayout>
  );
}
export default WelcomeScreen;
