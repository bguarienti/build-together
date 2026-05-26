import { createFileRoute } from "@tanstack/react-router";
import { Topbar } from "@/components/app/Topbar";
import { TasksView } from "@/components/app/tasks/TasksView";

export const Route = createFileRoute("/tasks")({
  head: () => ({ meta: [{ title: "Tarefas — Time Blocking" }] }),
  component: () => (
    <>
      <Topbar title="Tarefas" description="Crie, conclua e gerencie suas tarefas" />
      <div className="flex-1 p-6"><TasksView /></div>
    </>
  ),
});
