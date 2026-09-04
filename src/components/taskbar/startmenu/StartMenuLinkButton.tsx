import type { StartMenuLinkItem } from "../../../types/startMenu";

type StartMenuLinkButtonProps = {
  item: StartMenuLinkItem;
};

function StartMenuLinkButton({ item }: StartMenuLinkButtonProps) {
  return (
    <a
      href={item.href}
      target="_blank"
      rel="noreferrer"
      className="pointer flex w-full items-center gap-2 rounded-sm px-2 py-1 hover:bg-[#2f71cd]"
    >
      <img src={item.icon} alt="" className="h-5 w-5 shrink-0" />
      <span className="truncate font-tahoma text-[12px] leading-tight">
        {item.label}
      </span>
    </a>
  );
}

export default StartMenuLinkButton;
