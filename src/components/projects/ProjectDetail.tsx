import githubIcon from "@/assets/window/left-menu/github-icon.webp";
import webIcon from "@/assets/projects/tools/web.svg";
import type { Project, ProjectBlock } from "@/types/project";

type ProjectDetailProps = {
  project: Project;
};

function ProjectDetail({ project }: ProjectDetailProps) {
  const { title, date, tools = [], blocks = [], repoUrl, siteUrl } = project;

  return (
    <div className="relative h-full">
      <div className="h-full overflow-x-hidden overflow-y-auto bg-white p-2 pb-10 text-xs">
        <h2 className="text-lg">{title}</h2>
        {date && (
          <div className="mt-1 flex items-center gap-0.5 text-sm">
            <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="#000000"
                d="M9 10v2H7v-2zm4 0v2h-2v-2zm4 0v2h-2v-2zm2-7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h1V1h2v2h8V1h2v2zm0 16V8H5v11zM9 14v2H7v-2zm4 0v2h-2v-2zm4 0v2h-2v-2z"
              />
            </svg>
            <span>{date}</span>
          </div>
        )}

        {tools.length > 0 && (
          <div className="mt-3 ml-1 flex flex-wrap items-center gap-4">
            {tools.map((tool) => (
              <div key={tool.label} className="flex flex-col items-center">
                <img src={tool.icon} alt="" className="h-9 w-9" />
                <p className="mt-px font-bold">{tool.label}</p>
              </div>
            ))}
          </div>
        )}

        {blocks.length === 0 && <p className="mt-5">Details coming soon.</p>}

        {blocks.map((block) => (
          <section key={block.title}>
            <h3 className="mt-5 mb-2 text-sm font-bold">{block.title}</h3>
            <BlockContent block={block} />
          </section>
        ))}

        {repoUrl && (
          <div className="mt-5 flex justify-center">
            <a
              href={repoUrl}
              target="_blank"
              rel="noopener"
              className="pointer flex items-center gap-1 hover:text-[#1C68FF] hover:underline"
            >
              <img src={githubIcon} alt="" className="h-4 w-4" />
              View repository
            </a>
          </div>
        )}
      </div>

      {siteUrl && (
        <a
          href={siteUrl}
          target="_blank"
          rel="noopener"
          className="pointer absolute right-6 bottom-2 flex h-6 items-center justify-center rounded-sm border border-twilight-blue bg-[linear-gradient(180deg,#fff,#ecebe5_86%,#d8d0c4)] px-3 text-xs hover:shadow-[inset_-1px_1px_#fff0cf,inset_1px_2px_#fdd889,inset_-2px_2px_#fbc761,inset_2px_-2px_#e5a01a] active:bg-[linear-gradient(180deg,#cdcac3,#e3e3db_8%,#e5e5de_94%,#f2f2f1)]"
        >
          <img src={webIcon} alt="" className="mr-1 h-3 w-3" />
          Visit website
        </a>
      )}
    </div>
  );
}

function BlockContent({ block }: { block: ProjectBlock }) {
  switch (block.type) {
    case "paragraphs":
      return block.items.map((item) => <p key={item}>{item}</p>);
    case "list":
      return (
        <ul className="ml-3 list-disc">
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      );
    case "image":
      return (
        <>
          {block.caption && (
            <p className="mb-px text-gray-500 italic">{block.caption}</p>
          )}
          <img
            src={block.src}
            alt={block.alt}
            className="w-full max-w-[750px]"
          />
        </>
      );
  }
}

export default ProjectDetail;
