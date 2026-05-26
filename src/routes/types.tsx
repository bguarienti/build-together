import { createFileRoute } from "@tanstack/react-router";
import { Topbar } from "@/components/app/Topbar";
import { TypesView } from "@/components/app/types/TypesView";

export const Route = createFileRoute("/types")({
  head: () => ({ meta: [{ title: "Tipos — Time Blocking" }] }),
  component: () => (
    <>
      <Topbar title="Tipos de tarefa" description="Etiquetas reutilizáveis (Bug, Feature, Reunião…)" />
      <div className="flex-1 p-6"><TypesView /></div>
    </>
  ),
});
