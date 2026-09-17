export type MenuBarItem =
  | { type: "action"; label: string; onSelect: () => void; disabled?: boolean }
  | {
      type: "checkable";
      label: string;
      checked: boolean;
      onSelect: () => void;
      disabled?: boolean;
    }
  | { type: "separator" };

export type MenuBarMenu = {
  label: string;
  items: MenuBarItem[];
  disabled?: boolean;
};
