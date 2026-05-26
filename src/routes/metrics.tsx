import { createFileRoute } from "@tanstack/react-router";
import { Topbar } from "@/components/app/Topbar";
import { MetricsView } from "@/components/app/metrics/MetricsView";

export const Route = createFileRoute("/metrics")({
  head: () => ({ meta: [{ title: "Métricas — Time Blocking" }] }),
  component: () => (
    <>
      <Topbar title="Métricas" description="Tempo gasto, conclusões e replanejamentos" />
      <div className="flex-1 p-6"><MetricsView /></div>
    </>
  ),
});
