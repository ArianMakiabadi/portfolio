export type WindowHeaderToolsButton = {
  icon: string;
  label?: string;
  onSelect?: () => void;
  disabled?: boolean;
  hasDropdown?: boolean;
};

export type WindowHeaderToolsConfig = {
  groups: WindowHeaderToolsButton[][];
};
