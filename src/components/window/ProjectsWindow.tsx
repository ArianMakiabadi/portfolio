import { useState } from "react";
import Window from "./Window";
import ProjectList from "@/components/projects/ProjectList";
import ProjectDetail from "@/components/projects/ProjectDetail";
import { projectCategories } from "@/data/projects";
import projectsIcon from "@/assets/taskbar/icons/projects-icon-lg.webp";
import backIcon from "@/assets/window/header-tools/right-arrow-green-icon.webp";
import forwardIcon from "@/assets/window/header-tools/left-arrow-green-icon.webp";
import upIcon from "@/assets/window/header-tools/folder-opening-icon.webp";
import searchIcon from "@/assets/window/header-tools/magnifier-icon.webp";
import folderIcon from "@/assets/window/header-tools/folder-open-icon.webp";
import infoSystemIcon from "@/assets/window/left-menu/info-system-icon.webp";
import programsIcon from "@/assets/window/left-menu/programs-icon.webp";
import settingsIcon from "@/assets/window/left-menu/settings-icon.webp";
import networkingIcon from "@/assets/window/left-menu/networking-icon.webp";
import documentsIcon from "@/assets/window/left-menu/documents-icon.webp";
import sharedDocumentsIcon from "@/assets/window/left-menu/shared-documents-icon.webp";
import githubIcon from "@/assets/window/left-menu/github-icon.webp";
import linkedinIcon from "@/assets/window/left-menu/linkedin-icon.webp";
import contactMeIcon from "@/assets/taskbar/icons/contact-me.webp";
import type { MenuBarMenu } from "@/types/menuBar";
import type { WindowHeaderBarConfig } from "@/types/windowHeaderBar";
import type { WindowLeftMenuConfig } from "@/types/windowLeftMenu";

type ProjectsWindowProps = {
  onClose: () => void;
};

function ProjectsWindow({ onClose }: ProjectsWindowProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  const activeProject = projectCategories
    .flatMap((category) => category.projects)
    .find((project) => project.id === activeId);

  const handleBack = () => setActiveId(null);

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
          {
            icon: backIcon,
            label: "Back",
            disabled: !activeProject,
            isBack: true,
            onSelect: handleBack,
          },
          { icon: forwardIcon, disabled: true },
        ],
        [
          { icon: upIcon, onSelect: handleBack },
          { icon: searchIcon, label: "Search" },
          { icon: folderIcon, label: "Folders" },
        ],
        [{ icon: projectsIcon, hasDropdown: true }],
      ],
    },
    search: {
      icon: projectsIcon,
      path: activeProject ? `My Projects/${activeProject.name}` : "My Projects",
    },
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
            icon: contactMeIcon,
            label: "Contact me",
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
      {activeProject ? (
        <ProjectDetail project={activeProject} />
      ) : (
        <ProjectList
          categories={projectCategories}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onOpen={setActiveId}
        />
      )}
    </Window>
  );
}

export default ProjectsWindow;
