import { Topbar } from "@/components/app/Topbar";
import { TasksView } from "@/components/app/tasks/TasksView";

export function TasksPage() {
  return (
    <>
      <Topbar title="Tarefas" description="Crie, conclua e gerencie suas tarefas" />
      <div className="flex-1 p-6"><TasksView /></div>
    </>
  );
}
