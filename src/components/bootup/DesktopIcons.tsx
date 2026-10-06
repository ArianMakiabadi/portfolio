import IconItem from "@/components/shared/IconItem";
import { desktopItems } from "@/data/desktopItems";
import { useIconSelection } from "@/hooks/useIconSelection";

type DesktopIconsProps = {
  onOpenApp: (id: string) => void;
};

function DesktopIcons({ onOpenApp }: DesktopIconsProps) {
  const selection = useIconSelection();

  return (
    <div
      className="absolute inset-0 flex flex-col flex-wrap content-start items-start gap-4 p-3 pb-12 select-none"
      {...selection.containerProps}
    >
      {desktopItems.map((item) => (
        <IconItem
          key={item.id}
          variant="desktop"
          icon={item.icon}
          label={item.title}
          isSelected={item.id === selection.selectedId}
          onSelect={() => selection.select(item.id)}
          onOpen={() => onOpenApp(item.id)}
        />
      ))}
    </div>
  );
}

export default DesktopIcons;
