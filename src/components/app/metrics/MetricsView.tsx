import { useMemo } from "react";
import { useAppContext } from "@/hooks/useAppContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { calculateHoursByTaskType, calculateDelayMetrics } from "@/utils/metrics";
import { formatHoursMinutes } from "@/components/app/HoursMinutesInput";
import { AlertTriangle, Clock, CheckCircle2, RotateCw, XCircle, TrendingUp, TrendingDown } from "lucide-react";

export function MetricsView() {
  const { state, getAllMetrics } = useAppContext();
  const metrics = getAllMetrics();
  const typeMetrics = useMemo(
    () => calculateHoursByTaskType(state.tasks, state.taskTypes),
    [state.tasks, state.taskTypes]
  );
  const delayOverall = useMemo(
    () => calculateDelayMetrics(state.tasks, state.schedules),
    [state.tasks, state.schedules]
  );

  const totalHours = metrics.por_projeto.reduce((s: number, m: any) => s + m.tempo_gasto_total, 0) + metrics.ofensoras.tempo_gasto_total;

  return (
    <div className="space-y-6">
      {/* Por projeto */}
      <section>
        <header className="mb-3 flex items-end justify-between">
          <div>
            <h2 className="text-base font-semibold">Por projeto</h2>
            <p className="text-xs text-muted-foreground">Tempo registrado em tarefas concluídas</p>
          </div>
          <p className="font-mono text-sm text-muted-foreground">total: {totalHours.toFixed(1)}h</p>
        </header>
        {metrics.por_projeto.length === 0 ? (
          <p className="rounded-md border border-dashed py-12 text-center text-sm text-muted-foreground">Nenhum projeto cadastrado.</p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {metrics.por_projeto.map((m: any) => (
              <MetricCard key={m.projeto_id} metric={m} totalHours={totalHours} color={m.projeto_cor} name={m.projeto_nome} />
            ))}
          </div>
        )}
      </section>

      {/* Ofensoras */}
      <section>
        <header className="mb-3">
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <AlertTriangle className="h-4 w-4 text-destructive" /> Tarefas sem projeto
          </h2>
          <p className="text-xs text-muted-foreground">Identifique pontos de ruído na sua agenda</p>
        </header>
        <MetricCard metric={metrics.ofensoras} totalHours={totalHours} color="hsl(var(--destructive))" name="Ofensoras" />
      </section>

      {/* Por tipo */}
      {typeMetrics.length > 0 && (
        <section>
          <header className="mb-3">
            <h2 className="text-base font-semibold">Horas por tipo</h2>
            <p className="text-xs text-muted-foreground">Onde seu tempo realmente vai</p>
          </header>
          <Card>
            <CardContent className="space-y-3 p-4">
              {typeMetrics.map((t: any) => {
                const pct = totalHours > 0 ? (t.hours / totalHours) * 100 : 0;
                return (
                  <div key={t.name} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Badge style={{ backgroundColor: t.color }} className="text-white">{t.name}</Badge>
                        <span className="text-xs text-muted-foreground">{t.count} concluída(s)</span>
                      </div>
                      <span className="font-mono">{t.hours.toFixed(1)}h · {pct.toFixed(0)}%</span>
                    </div>
                    <Progress value={pct} className="h-1.5" />
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </section>
      )}

      {/* Desvios: planejado vs realizado */}
      <section>
        <header className="mb-3">
          <h2 className="text-base font-semibold">Planejado vs realizado</h2>
          <p className="text-xs text-muted-foreground">
            Compara a duração agendada com o tempo gasto nas tarefas concluídas
          </p>
        </header>
        {delayOverall.avaliadas === 0 ? (
          <p className="rounded-md border border-dashed py-6 text-center text-sm text-muted-foreground">
            Nenhuma tarefa concluída com agendamento ainda.
          </p>
        ) : (
          <Card>
            <CardContent className="grid gap-4 p-4 md:grid-cols-4">
              <DelayStat
                label="Avaliadas"
                value={String(delayOverall.avaliadas)}
                icon={CheckCircle2}
                color="text-foreground"
              />
              <DelayStat
                label="Desviadas"
                value={`${delayOverall.desviadas} / ${delayOverall.avaliadas}`}
                icon={TrendingUp}
                color="text-amber-600"
              />
              <DelayStat
                label="Desvio médio"
                value={
                  delayOverall.desvio_medio_horas >= 0
                    ? `+${formatHoursMinutes(Math.abs(delayOverall.desvio_medio_horas))}`
                    : `-${formatHoursMinutes(Math.abs(delayOverall.desvio_medio_horas))}`
                }
                icon={delayOverall.desvio_medio_horas >= 0 ? TrendingUp : TrendingDown}
                color={delayOverall.desvio_medio_horas > 0 ? "text-amber-600" : "text-emerald-600"}
              />
              <DelayStat
                label="Desvio total"
                value={`${delayOverall.desvio_pct > 0 ? "+" : ""}${delayOverall.desvio_pct}%`}
                icon={Clock}
                color={delayOverall.desvio_pct > 0 ? "text-amber-600" : "text-emerald-600"}
              />
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}

function DelayStat({ icon: Icon, label, value, color }: any) {
  return (
    <div className="flex items-start gap-2">
      <Icon className={`mt-0.5 h-4 w-4 ${color}`} />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={`font-mono text-lg font-semibold ${color}`}>{value}</p>
      </div>
    </div>
  );
}

function MetricCard({ metric, totalHours, color, name }: any) {
  const pct = totalHours > 0 ? (metric.tempo_gasto_total / totalHours) * 100 : 0;
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-sm" style={{ backgroundColor: color }} />
          <CardTitle className="text-sm">{name}</CardTitle>
        </div>
        <CardDescription className="font-mono text-2xl text-foreground">{metric.tempo_gasto_total.toFixed(1)}h</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        <Progress value={pct} className="h-1.5" />
        <div className="grid grid-cols-2 gap-2 text-xs">
          <Stat icon={CheckCircle2} label="Concluídas" value={metric.tarefas_concluidas} color="text-emerald-600" />
          <Stat icon={Clock} label="Agendadas" value={metric.tarefas_agendadas} color="text-blue-600" />
          <Stat icon={Clock} label="Abertas" value={metric.tarefas_abertas} color="text-slate-600" />
          <Stat icon={XCircle} label="Canceladas" value={metric.tarefas_canceladas} color="text-zinc-500" />
          <Stat icon={RotateCw} label="Replanejam." value={metric.total_replanejamentos} color="text-amber-600" />
        </div>
      </CardContent>
    </Card>
  );
}

function Stat({ icon: Icon, label, value, color }: any) {
  return (
    <div className="flex items-center gap-1.5">
      <Icon className={`h-3 w-3 ${color}`} />
      <span className="text-muted-foreground">{label}</span>
      <span className="ml-auto font-mono font-medium">{value}</span>
    </div>
  );
}
