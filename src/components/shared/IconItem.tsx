type IconItemProps = {
  icon: string;
  label: string;
  isSelected: boolean;
  variant: "list" | "desktop";
  onSelect: () => void;
  onOpen: () => void;
};

function IconItem({
  icon,
  label,
  isSelected,
  variant,
  onSelect,
  onOpen,
}: IconItemProps) {
  const isDesktop = variant === "desktop";
  const idleText = isDesktop
    ? "text-white [text-shadow:1px_1px_1px_#000]"
    : "text-black";

  return (
    <div
      data-icon-item
      className={`pointer flex items-center ${
        isDesktop ? "w-20 flex-col gap-1 text-center" : "gap-2.5 px-4 pb-2"
      }`}
      onMouseDown={onSelect}
      onDoubleClick={onOpen}
    >
      <img
        src={icon}
        alt=""
        draggable={false}
        className={`h-10 w-10 ${isSelected ? "opacity-50" : ""}`}
      />
      <p
        className={`text-xs font-medium ${isDesktop ? "px-0.5" : ""} ${
          isSelected ? "bg-[#0B61FF] text-white" : idleText
        }`}
      >
        {label}
      </p>
    </div>
  );
}

export default IconItem;
