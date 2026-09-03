import type { StartMenuAppItem } from "../../types/startMenu";

type StartMenuAppButtonProps = {
  item: StartMenuAppItem;
  onSelect: (id: string) => void;
};

function StartMenuAppButton({ item, onSelect }: StartMenuAppButtonProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(item.id)}
      className="pointer flex w-full items-center gap-2 rounded-sm px-2 py-1 text-left hover:bg-[#2f71cd] hover:text-white"
    >
      <img src={item.icon} alt="" className="h-8 w-8 shrink-0" />
      <span className="min-w-0">
        <span className="block truncate font-tahoma font-bold text-[11px] leading-tight">
          {item.title}
        </span>
        <span className="block truncate font-tahoma text-[11px] leading-tight opacity-80">
          {item.subtitle}
        </span>
      </span>
    </button>
  );
}

export default StartMenuAppButton;
