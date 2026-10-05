import type { MouseEvent } from "react";
import type { ProjectCategory } from "@/types/project";

type ProjectListProps = {
  categories: ProjectCategory[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onOpen: (id: string) => void;
};

function ProjectList({
  categories,
  selectedId,
  onSelect,
  onOpen,
}: ProjectListProps) {
  const handleBackgroundMouseDown = (event: MouseEvent<HTMLDivElement>) => {
    if (!(event.target as HTMLElement).closest("[data-project-card]")) {
      onSelect(null);
    }
  };

  return (
    <div
      className="flex h-full flex-col overflow-auto bg-white pt-0.5 select-none"
      onMouseDown={handleBackgroundMouseDown}
    >
      {categories.map((category) => (
        <div key={category.name} className="relative mb-3">
          <h1 className="px-3 text-xs font-semibold">{category.name}</h1>
          <div className="absolute top-5 -left-3 h-px w-80 bg-linear-to-r from-blue-300 to-white" />
          <div className="flex w-full flex-wrap gap-2 pt-3 pb-3">
            {category.projects.map((project) => {
              const isSelected = project.id === selectedId;
              return (
                <div
                  key={project.id}
                  data-project-card
                  className="pointer flex items-center gap-2.5 px-4 pb-2"
                  onMouseDown={() => onSelect(project.id)}
                  onDoubleClick={() => onOpen(project.id)}
                >
                  <img
                    src={project.icon}
                    alt=""
                    className={`h-10 w-10 ${isSelected ? "opacity-50" : ""}`}
                  />
                  <p
                    className={`text-xs font-medium ${
                      isSelected ? "bg-[#0B61FF] text-white" : "text-black"
                    }`}
                  >
                    {project.name}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export default ProjectList;
