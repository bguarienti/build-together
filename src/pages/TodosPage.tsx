import { Topbar } from "@/components/app/Topbar";
import { TodosView } from "@/components/app/todos/TodosView";

export function TodosPage() {
  return (
    <>
      <Topbar title="TODOs" description="Itens acionáveis com prazo, vinculados ou não a tarefas" />
      <div className="flex-1 p-6"><TodosView /></div>
    </>
  );
}
