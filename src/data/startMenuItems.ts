import {
  contactMeIcon,
  cvIcon,
  githubIcon,
  instagramIcon,
  pinballIcon,
  linkedinIcon,
  noteIcon,
  paintIcon,
  pdfIcon,
  projectsIcon,
  solitaireIcon,
  minesweeperIcon,
} from "./startMenuIcons";

import type { StartMenuAppItem, StartMenuLinkItem } from "../types/startMenu";

export const startMenuApps: StartMenuAppItem[] = [
  {
    id: "projects",
    title: "My Projects",
    subtitle: "See all my projects",
    icon: projectsIcon,
  },
  {
    id: "cv",
    title: "My CV",
    subtitle: "View my resume",
    icon: cvIcon,
  },
  {
    id: "notepad",
    title: "Notepad",
    subtitle: "Read my notes",
    icon: noteIcon,
  },
  {
    id: "paint",
    title: "Paint",
    subtitle: "Doodle something fun!",
    icon: paintIcon,
  },
  {
    id: "minesweeper",
    title: "Minesweeper",
    subtitle: "Can you clear the board?",
    icon: minesweeperIcon,
  },
  {
    id: "solitaire",
    title: "Solitaire",
    subtitle: "Deal yourself a game",
    icon: solitaireIcon,
  },
  {
    id: "pinball",
    title: "3D Pinball",
    subtitle: "Space Cadet awaits",
    icon: pinballIcon,
  },

  {
    id: "contact",
    title: "Contact Me",
    subtitle: "Get in touch",
    icon: contactMeIcon,
  },
];

export const startMenuLinks: StartMenuLinkItem[] = [
  {
    id: "github",
    label: "GitHub",
    icon: githubIcon,
    href: "https://github.com/ArianMakiabadi",
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    icon: linkedinIcon,
    href: "https://linkedin.com/in/ArianMakiabadi",
  },
  {
    id: "instagram",
    label: "Instagram",
    icon: instagramIcon,
    href: "https://instagram.com/Arian.Maki",
  },
  {
    id: "resume",
    label: "Download CV",
    icon: pdfIcon,
    href: "#",
  },
];
