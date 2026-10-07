import { useEffect } from "react";
import windowsFlag from "@/assets/logos/windows-flag-only.webp";
import logoffIcon from "@/assets/taskbar/icons/key-log-icon.webp";
import restartIcon from "@/assets/taskbar/icons/restart.webp";
import shutdownIcon from "@/assets/taskbar/icons/shutdown-icon.webp";

export type PowerDialogMode = "logoff" | "shutdown";

type PowerDialogProps = {
  mode: PowerDialogMode;
  onCancel: () => void;
  onLogOff: () => void;
  onRestart: () => void;
};

type PowerOptionProps = {
  icon: string;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
};

const BAR_CLASS =
  "flex h-[50px] items-center bg-linear-to-r from-[#002a8c] via-[#0039a9] to-[#002a8c]";

function PowerOption({ icon, label, onClick, disabled }: PowerOptionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`group flex w-20 flex-col items-center text-center ${
        disabled ? "pointer-events-none opacity-60" : "pointer"
      }`}
    >
      <img
        src={icon}
        alt=""
        draggable="false"
        className="mb-1.5 h-10 w-10 drop-shadow-[1px_1px_1px_rgba(0,0,0,0.4)] transition-[filter] duration-150 ease-in-out group-hover:brightness-[1.06] group-hover:drop-shadow-[1px_1px_2px_rgba(0,0,0,0.5)]"
      />
      <span className="font-tahoma text-[13.5px] leading-[1.2] text-white [text-shadow:1px_1px_1px_rgba(0,0,0,0.4)]">
        {label}
      </span>
    </button>
  );
}

function PowerDialog({
  mode,
  onCancel,
  onLogOff,
  onRestart,
}: PowerDialogProps) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onCancel();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onCancel]);

  const title =
    mode === "logoff" ? "Log Off Portfolio XP" : "Turn off Portfolio XP";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-[10001] flex items-center justify-center"
    >
      <div className="w-[350px] border border-[#2b2b2b] shadow-[0_0_10px_rgba(0,0,0,0.5)] max-[480px]:scale-90">
        <div
          className={`${BAR_CLASS} relative justify-between py-1 pl-4 pr-1 font-arial text-[20px] font-medium tracking-[0.1px] text-white`}
        >
          <span>{title}</span>
          <img
            src={windowsFlag}
            alt=""
            draggable="false"
            className="mr-2.5 h-8 w-8 shrink-0 object-contain"
          />
          <div className="pointer-events-none absolute inset-x-0 -bottom-px h-0.5 bg-[linear-gradient(90deg,transparent_25%,#bad7f8_45%,#bad7f8_55%,transparent_75%)]" />
        </div>

        <div className="flex items-center justify-evenly bg-linear-to-r from-[#587cdb] via-[#688ceb] to-[#587cdb] py-9">
          <PowerOption icon={restartIcon} label="Restart" onClick={onRestart} />
          {mode === "logoff" ? (
            <PowerOption icon={logoffIcon} label="Log Off" onClick={onLogOff} />
          ) : (
            <PowerOption icon={shutdownIcon} label="Shut Down" disabled />
          )}
        </div>

        <div className={`${BAR_CLASS} justify-end px-[15px]`}>
          <button
            type="button"
            onClick={onCancel}
            className="pointer h-[23px] w-[75px] rounded-[3px] border border-[#003c74] bg-white font-tahoma text-[11px] text-black hover:shadow-[inset_0_0_0_1px_#e5a01a]"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default PowerDialog;
