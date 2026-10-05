import folderIcon from "@/assets/window/header-tools/folder-open-icon.webp";
import reactIcon from "@/assets/projects/tools/react.svg";
import typescriptIcon from "@/assets/projects/tools/typescript.svg";
import viteIcon from "@/assets/projects/tools/vite.svg";
import tailwindIcon from "@/assets/projects/tools/tailwind.svg";
import tanstackQueryIcon from "@/assets/projects/tools/tanstack-query.svg";
import nodejsIcon from "@/assets/projects/tools/nodejs.svg";
import expressIcon from "@/assets/projects/tools/express.svg";
import mongodbIcon from "@/assets/projects/tools/mongodb.svg";
import twilioIcon from "@/assets/projects/tools/twilio.svg";
import type { ProjectCategory } from "@/types/project";

export const projectCategories: ProjectCategory[] = [
  {
    name: "Websites",
    projects: [
      {
        id: "jobhop",
        name: "JobHop",
        icon: folderIcon,
        title: "JobHop - Full-stack freelancing platform",
        repoUrl: "https://github.com/ArianMakiabadi/JobHop",
        siteUrl: "https://jobhop.makiabadi.com/",
        tools: [
          { icon: reactIcon, label: "React" },
          { icon: typescriptIcon, label: "TypeScript" },
          { icon: viteIcon, label: "Vite" },
          { icon: tailwindIcon, label: "Tailwind" },
          { icon: tanstackQueryIcon, label: "TanStack Query" },
          { icon: nodejsIcon, label: "Node.js" },
          { icon: expressIcon, label: "Express" },
          { icon: mongodbIcon, label: "MongoDB" },
          { icon: twilioIcon, label: "Twilio" },
        ],
        blocks: [
          {
            type: "paragraphs",
            title: "Context",
            items: [
              "JobHop is a full-stack marketplace connecting employers with freelance talent.",
              "It features phone-based sign-in, an admin approval workflow, and role-specific workspaces for employers, freelancers, and administrators.",
            ],
          },
          {
            type: "list",
            title: "What it does",
            items: [
              "Visitors sign in with a phone number and OTP verification",
              "New users complete their profile and pick an employer or freelancer role",
              "An administrator reviews and approves new accounts",
              "Employers publish projects with category, budget, tags, and deadline",
              "Freelancers browse projects and submit proposals with price, duration, and an introduction",
              "Employers review proposals and accept or reject them",
            ],
          },
          {
            type: "list",
            title: "Highlights",
            items: [
              "Phone-number authentication with SMS OTP via Twilio Verify",
              "Signed, HTTP-only access and refresh-token cookies",
              "Role- and approval-aware route protection",
              "Project catalog with text search, category filtering, and date sorting",
              "Project status controls and proposal workflow",
              "Responsive interface with light and dark themes",
            ],
          },
          {
            type: "list",
            title: "Architecture",
            items: [
              "Frontend: React 18, TypeScript, Vite, React Router, TanStack Query, React Hook Form, Tailwind CSS",
              "Backend: Node.js, TypeScript, Express, Mongoose, Joi, JSON Web Tokens",
              "Data: MongoDB",
              "Authentication: Twilio Verify, signed cookies, JWT access and refresh tokens",
            ],
          },
        ],
      },
      {
        id: "project-beta",
        name: "Project Beta",
        icon: folderIcon,
        title: "Project Beta",
      },
      {
        id: "project-gamma",
        name: "Project Gamma",
        icon: folderIcon,
        title: "Project Gamma",
      },
    ],
  },
];
