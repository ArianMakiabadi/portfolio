export type MenuBarItem =
  | { type: "action"; label: string; onSelect: () => void }
  | { type: "checkable"; label: string; checked: boolean; onSelect: () => void }
  | { type: "separator" };

export type MenuBarMenu = {
  label: string;
  items: MenuBarItem[];
  disabled?: boolean;
};
