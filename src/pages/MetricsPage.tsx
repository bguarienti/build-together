import { Topbar } from "@/components/app/Topbar";
import { MetricsView } from "@/components/app/metrics/MetricsView";

export function MetricsPage() {
  return (
    <>
      <Topbar title="Métricas" description="Tempo gasto, conclusões e replanejamentos" />
      <div className="flex-1 p-6"><MetricsView /></div>
    </>
  );
}
