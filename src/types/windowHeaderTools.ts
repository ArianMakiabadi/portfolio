export type WindowHeaderToolsButton = {
  icon: string;
  label?: string;
  onSelect?: () => void;
  disabled?: boolean;
  hasDropdown?: boolean;
  isBack?: boolean;
};

export type WindowHeaderToolsConfig = {
  groups: WindowHeaderToolsButton[][];
};
