import SessionScreenLayout from "./SessionScreenLayout";
import windowsLogo from "@/assets/logos/windows-logo.webp";

type ShutdownPhase = "logging-off" | "shutting-down";

type ShutdownScreenProps = {
  phase: ShutdownPhase;
};

const PHASE_MESSAGES: Record<ShutdownPhase, string> = {
  "logging-off": "Logging off...",
  "shutting-down": "Portfolio is shutting down...",
};

function ShutdownScreen({ phase }: ShutdownScreenProps) {
  return (
    <SessionScreenLayout>
      {/* Right edge sits 300px past the horizontal centre, slightly above the
          vertical centre of the area between the bars; the text left-aligns
          to that edge. */}
      <div className="absolute right-[calc(50%-300px)] top-[calc(45%+11.2px)] flex -translate-y-1/2 flex-col items-start">
        <img
          className="relative h-auto w-56"
          src={windowsLogo}
          alt="Windows"
          draggable="false"
        />
        <p className="mt-3 -mb-1.5 ml-0.75 font-arial text-lg text-nowrap text-white">
          {PHASE_MESSAGES[phase]}
        </p>
      </div>
    </SessionScreenLayout>
  );
}
export default ShutdownScreen;
