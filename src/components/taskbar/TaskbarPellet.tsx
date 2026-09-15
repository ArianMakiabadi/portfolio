import { memo } from "react";

type TaskbarPelletProps = {
  id: string;
  title: string;
  iconSrc: string;
  isActive: boolean;
  onFocus: (id: string) => void;
};

function TaskbarPellet({
  id,
  title,
  iconSrc,
  isActive,
  onFocus,
}: TaskbarPelletProps) {
  return (
    <button
      type="button"
      onClick={() => onFocus(id)}
      className={`pointer mt-px flex h-full min-w-44 shrink-0 items-center gap-1 rounded-sm px-2 py-1 hover:brightness-110 ${
        isActive ? "taskbar-pellet-active" : "taskbar-pellet-deactivated"
      }`}
    >
      <img src={iconSrc} alt="" className="h-4 w-4 shrink-0" />
      <span className="hidden truncate font-tahoma text-[11px] text-white sm:block">
        {title}
      </span>
    </button>
  );
}

export default memo(TaskbarPellet);
