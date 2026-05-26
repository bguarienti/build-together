import { Topbar } from "@/components/app/Topbar";
import { ProjectsView } from "@/components/app/projects/ProjectsView";

export function ProjectsPage() {
  return (
    <>
      <Topbar title="Projetos" description="Organize tarefas por contexto" />
      <div className="flex-1 p-6"><ProjectsView /></div>
    </>
  );
}
