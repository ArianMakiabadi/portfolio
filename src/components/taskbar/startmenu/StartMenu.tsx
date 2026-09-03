import { forwardRef } from "react";
import profilePhoto from "../../../assets/profile-photo.webp";
import logoffIcon from "../../../assets/taskbar/icons/key-log-icon.webp";
import shutdownIcon from "../../../assets/taskbar/icons/shutdown-icon.webp";
import { startMenuApps, startMenuLinks } from "../../../data/startMenuItems";
import StartMenuAppButton from "./StartMenuAppButton";
import StartMenuLinkButton from "./StartMenuLinkButton";
import allPrograms from "../../../assets/taskbar/icons/all-programs.webp";

type StartMenuProps = {
  onSelectApp: (id: string) => void;
  onLogOff: () => void;
  onShutDown: () => void;
};

const StartMenu = forwardRef<HTMLDivElement, StartMenuProps>(
  ({ onSelectApp, onLogOff, onShutDown }, ref) => {
    return (
      <div
        ref={ref}
        className="start-menu-shadow absolute bottom-full left-0 z-50 w-[360px] max-w-[92vw] overflow-hidden rounded-t-lg bg-[#6487DC]"
      >
        <div className="start-menu-banner flex h-16 items-center gap-2 px-2">
          <img
            src={profilePhoto}
            alt=""
            className="h-11 w-11 rounded-sm border-2 border-white"
          />
          <h2 className="start-menu-text-shadow font-arial text-lg text-white">
            Arian Makiabadi
          </h2>
        </div>

        <div className="start-menu-divider h-0.5 w-full" />

        <div className="flex">
          <div className="flex w-7/12 flex-col gap-0.5 bg-white px-1 py-1">
            {startMenuApps.map((item) => (
              <StartMenuAppButton
                key={item.id}
                item={item}
                onSelect={onSelectApp}
              />
            ))}

            <div className="mx-1 my-0.5 h-px bg-linear-to-r from-[#b8cbe8] via-[#6d91c9] to-[#b8cbe8]" />

            <button
              type="button"
              className="pointer flex w-full items-center justify-center gap-2 rounded-sm px-2 py-1 text-center hover:bg-[#2f71cd] hover:text-white"
            >
              <span className="min-w-0">
                <span className="block truncate font-tahoma font-bold text-[11px] leading-tight">
                  All Programs
                </span>
              </span>
              <img src={allPrograms} alt="" className="h-5 w-5 shrink-0" />
            </button>
          </div>
          <div className="flex w-5/12 flex-col gap-0.5 border-l border-[#3a3aff]/40 bg-[#D3E5FB] px-1 py-1">
            {startMenuLinks.map((item) => (
              <StartMenuLinkButton key={item.id} item={item} />
            ))}
          </div>
        </div>

        <div className="start-menu-footer flex h-12 items-center justify-end gap-3 px-2">
          <button
            type="button"
            onClick={onLogOff}
            className="pointer flex items-center gap-1.5 rounded-sm px-2 py-1 text-white hover:bg-white/20"
          >
            <img src={logoffIcon} alt="" className="h-7 w-7" />
            <span className="font-tahoma text-[12px]">Log Off</span>
          </button>
          <button
            type="button"
            onClick={onShutDown}
            className="pointer flex items-center gap-1.5 rounded-sm px-2 py-1 text-white hover:bg-white/20"
          >
            <img src={shutdownIcon} alt="" className="h-7 w-7" />
            <span className="font-tahoma text-[12px]">Shut Down</span>
          </button>
        </div>
      </div>
    );
  },
);

export default StartMenu;
