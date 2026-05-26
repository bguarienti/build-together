import { createFileRoute } from "@tanstack/react-router";
import { Topbar } from "@/components/app/Topbar";
import { ProjectsView } from "@/components/app/projects/ProjectsView";

export const Route = createFileRoute("/projects")({
  head: () => ({ meta: [{ title: "Projetos — Time Blocking" }] }),
  component: () => (
    <>
      <Topbar title="Projetos" description="Organize tarefas por contexto" />
      <div className="flex-1 p-6"><ProjectsView /></div>
    </>
  ),
});
