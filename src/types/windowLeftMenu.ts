export type WindowLeftMenuItem = {
  icon: string;
  label: string;
  onSelect?: () => void;
  href?: string;
};

export type WindowLeftMenuSection = {
  title: string;
  items: WindowLeftMenuItem[];
};

export type WindowLeftMenuConfig = {
  sections: WindowLeftMenuSection[];
};
