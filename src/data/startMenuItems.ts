import contactMeIcon from "../assets/taskbar/icons/contact-me.webp";
import cvIcon from "../assets/taskbar/icons/cv-icon-lg.webp";
import githubIcon from "../assets/taskbar/icons/github.webp";
import instagramIcon from "../assets/taskbar/icons/instagram.webp";
import cmdIcon from "../assets/taskbar/icons/cmd-icon.webp";
import linkedinIcon from "../assets/taskbar/icons/linkedin.webp";
import noteIcon from "../assets/taskbar/icons/note.webp";
import paintIcon from "../assets/taskbar/icons/paint.webp";
import pdfIcon from "../assets/taskbar/icons/pdf.webp";
import playerIcon from "../assets/taskbar/icons/player.webp";
import projectsIcon from "../assets/taskbar/icons/projects-icon-lg.webp";
import minesweeper from "../assets/taskbar/icons/minesweeper-icon.webp";

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
    icon: minesweeper,
  },
  {
    id: "player",
    title: "Music Player",
    subtitle: "Listen to my playlist",
    icon: playerIcon,
  },
  {
    id: "terminal",
    title: "Command Prompt",
    subtitle: "Explore through the CLI",
    icon: cmdIcon,
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
