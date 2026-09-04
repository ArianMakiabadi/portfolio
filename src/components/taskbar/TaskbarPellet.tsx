type TaskbarPelletProps = {
  title: string;
  iconSrc: string;
  isActive: boolean;
  onClick: () => void;
};

function TaskbarPellet({
  title,
  iconSrc,
  isActive,
  onClick,
}: TaskbarPelletProps) {
  return (
    <button
      type="button"
      onClick={onClick}
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

export default TaskbarPellet;
