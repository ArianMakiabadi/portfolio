export type ProjectTool = {
  icon: string;
  label: string;
};

export type ProjectBlock =
  | { type: "paragraphs"; title: string; items: string[] }
  | { type: "list"; title: string; items: string[] }
  | {
      type: "image";
      title: string;
      src: string;
      alt: string;
      caption?: string;
    };

export type Project = {
  id: string;
  name: string;
  icon: string;
  title: string;
  date?: string;
  tools?: ProjectTool[];
  blocks?: ProjectBlock[];
  repoUrl?: string;
  siteUrl?: string;
};

export type ProjectCategory = {
  name: string;
  projects: Project[];
};
