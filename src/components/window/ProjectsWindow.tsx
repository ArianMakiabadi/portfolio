import Window from "./Window";
import projectsIcon from "../../assets/taskbar/icons/projects-icon-lg.webp";
import backIcon from "../../assets/window/header-tools/right-arrow-green-icon.webp";
import forwardIcon from "../../assets/window/header-tools/left-arrow-green-icon.webp";
import upIcon from "../../assets/window/header-tools/folder-opening-icon.webp";
import searchIcon from "../../assets/window/header-tools/magnifier-icon.webp";
import folderIcon from "../../assets/window/header-tools/folder-open-icon.webp";
import infoSystemIcon from "../../assets/window/left-menu/info-system-icon.webp";
import programsIcon from "../../assets/window/left-menu/programs-icon.webp";
import settingsIcon from "../../assets/window/left-menu/settings-icon.webp";
import networkingIcon from "../../assets/window/left-menu/networking-icon.webp";
import documentsIcon from "../../assets/window/left-menu/documents-icon.webp";
import sharedDocumentsIcon from "../../assets/window/left-menu/shared-documents-icon.webp";
import githubIcon from "../../assets/window/left-menu/github-icon.webp";
import linkedinIcon from "../../assets/window/left-menu/linkedin-icon.webp";
import buyMeACoffeeIcon from "../../assets/window/left-menu/buy-me-a-coffee-icon.webp";
import type { MenuBarMenu } from "../../types/menuBar";
import type { WindowHeaderBarConfig } from "../../types/windowHeaderBar";
import type { WindowLeftMenuConfig } from "../../types/windowLeftMenu";

type ProjectsWindowProps = {
  onClose: () => void;
};

const PLACEHOLDER_PROJECTS = ["Project Alpha", "Project Beta", "Project Gamma"];

function ProjectsWindow({ onClose }: ProjectsWindowProps) {
  const menus: MenuBarMenu[] = [
    {
      label: "File",
      items: [{ type: "action", label: "Exit", onSelect: () => onClose() }],
    },
    { label: "Edit", items: [{ type: "separator" }] },
    { label: "View", items: [{ type: "separator" }] },
    { label: "Tools", items: [{ type: "separator" }] },
  ];

  const headerBar: WindowHeaderBarConfig = {
    tools: {
      groups: [
        [
          { icon: backIcon, label: "Back", disabled: true },
          { icon: forwardIcon, disabled: true },
        ],
        [
          { icon: upIcon },
          { icon: searchIcon, label: "Search" },
          { icon: folderIcon, label: "Folders" },
        ],
        [{ icon: projectsIcon, hasDropdown: true }],
      ],
    },
    search: { icon: projectsIcon, path: "My Projects" },
  };

  const leftMenu: WindowLeftMenuConfig = {
    sections: [
      {
        title: "System Tasks",
        items: [
          { icon: infoSystemIcon, label: "View System Information" },
          { icon: programsIcon, label: "Add or Remove Programs" },
          { icon: settingsIcon, label: "Change a Setting" },
        ],
      },
      {
        title: "Other",
        items: [
          { icon: networkingIcon, label: "My Network Places" },
          { icon: documentsIcon, label: "My Documents" },
          { icon: sharedDocumentsIcon, label: "Shared Documents" },
          { icon: settingsIcon, label: "Control Panel" },
        ],
      },
      {
        title: "Details",
        items: [
          {
            icon: githubIcon,
            label: "My Github",
            href: "https://github.com/ArianMakiabadi",
          },
          {
            icon: linkedinIcon,
            label: "My LinkedIn",
            href: "https://linkedin.com/in/ArianMakiabadi",
          },
          {
            icon: buyMeACoffeeIcon,
            label: "Buy Me a Coffee",
            href: "#",
          },
        ],
      },
    ],
  };

  return (
    <Window
      id="projects"
      iconSrc={projectsIcon}
      title="My Projects"
      menus={menus}
      headerBar={headerBar}
      leftMenu={leftMenu}
      initialSize={{ width: 640, height: 460 }}
      initialPosition={{ x: 260, y: 110 }}
      minSize={{ width: 480, height: 320 }}
      onClose={onClose}
    >
      <div className="h-full overflow-auto bg-white p-4">
        <p className="mb-3 text-xs font-bold text-gray-600">
          Placeholder content — not the real Projects feature yet.
        </p>
        <div className="flex flex-wrap gap-4">
          {PLACEHOLDER_PROJECTS.map((name) => (
            <div key={name} className="flex w-20 flex-col items-center gap-1">
              <img src={folderIcon} alt="" className="h-8 w-8" />
              <span className="text-center text-xs">{name}</span>
            </div>
          ))}
        </div>
      </div>
    </Window>
  );
}

export default ProjectsWindow;
