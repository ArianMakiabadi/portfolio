export type InfoStripLink = {
  href: string;
  title: string;
};

export type InfoStripConfig = {
  items: string[];
  link?: InfoStripLink;
};
