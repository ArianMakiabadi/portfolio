import IconItem from "@/components/shared/IconItem";
import type { IconSelection } from "@/hooks/useIconSelection";
import type { ProjectCategory } from "@/types/project";

type ProjectListProps = {
  categories: ProjectCategory[];
  selection: IconSelection;
  onOpen: (id: string) => void;
};

function ProjectList({ categories, selection, onOpen }: ProjectListProps) {
  return (
    <div
      className="flex h-full flex-col overflow-auto bg-white pt-0.5 select-none"
      {...selection.containerProps}
    >
      {categories.map((category) => (
        <div key={category.name} className="relative mb-3">
          <h1 className="px-3 text-xs font-semibold">{category.name}</h1>
          <div className="absolute top-5 -left-3 h-px w-80 bg-linear-to-r from-blue-300 to-white" />
          <div className="flex w-full flex-wrap gap-2 pt-3 pb-3">
            {category.projects.map((project) => (
              <IconItem
                key={project.id}
                variant="list"
                icon={project.icon}
                label={project.name}
                isSelected={project.id === selection.selectedId}
                onSelect={() => selection.select(project.id)}
                onOpen={() => onOpen(project.id)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default ProjectList;
