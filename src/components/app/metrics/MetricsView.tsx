import { useMemo, useState } from "react";
import { useAppContext } from "@/hooks/useAppContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { calculateHoursByTaskType, calculateDelayMetrics } from "@/utils/metrics";
import { formatHoursMinutes } from "@/components/app/HoursMinutesInput";
import { cn } from "@/lib/utils";
import { AlertTriangle, Clock, CheckCircle2, RotateCw, XCircle, TrendingUp, TrendingDown, Calendar as CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { DateRange } from "react-day-picker";

// Retorna a data relevante de uma tarefa para fins de filtro temporal
function getTaskRelevantTimestamp(task: any): number | null {
  if (task.estado === "concluída") return task.data_conclusao ?? task.data_criacao ?? null;
  if (task.estado === "cancelada") return task.data_cancelamento ?? task.data_criacao ?? null;
  if (task.estado === "agendada") return task.data_agendado ?? task.data_criacao ?? null;
  return task.data_criacao ?? null;
}

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function endOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

export function MetricsView() {
  const { state } = useAppContext();

  // Filtro de período (default: últimos 30 dias)
  const defaultRange: DateRange = useMemo(() => {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - 29);
    return { from, to };
  }, []);
  const [range, setRange] = useState<DateRange | undefined>(defaultRange);

  const filteredTasks = useMemo(() => {
    if (!range?.from && !range?.to) return state.tasks;
    const fromMs = range?.from ? startOfDay(range.from).getTime() : -Infinity;
    const toMs = range?.to ? endOfDay(range.to).getTime() : range?.from ? endOfDay(range.from).getTime() : Infinity;
    return state.tasks.filter((t: any) => {
      if (!t.ativo) return true; // mantém flag, filtrado depois
      const ts = getTaskRelevantTimestamp(t);
      if (ts == null) return false;
      return ts >= fromMs && ts <= toMs;
    });
  }, [state.tasks, range]);

  const metrics = useMemo(() => computeAllMetrics(filteredTasks, state.projects), [filteredTasks, state.projects]);
  const typeMetrics = useMemo(
    () => calculateHoursByTaskType(filteredTasks, state.taskTypes),
    [filteredTasks, state.taskTypes]
  );
  const delayOverall = useMemo(
    () => calculateDelayMetrics(filteredTasks, state.schedules),
    [filteredTasks, state.schedules]
  );

  const totalHours = metrics.por_projeto.reduce((s: number, m: any) => s + m.tempo_gasto_total, 0) + metrics.ofensoras.tempo_gasto_total;

  const setPreset = (days: number) => {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - (days - 1));
    setRange({ from, to });
  };

  const rangeLabel = range?.from
    ? range.to && range.to.getTime() !== range.from.getTime()
      ? `${format(range.from, "dd/MM/yy", { locale: ptBR })} – ${format(range.to, "dd/MM/yy", { locale: ptBR })}`
      : format(range.from, "dd/MM/yyyy", { locale: ptBR })
    : "Todo o período";

  return (
    <div className="space-y-6">
      {/* Filtro por período */}
      <div className="flex flex-wrap items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className={cn("justify-start gap-2 font-normal", !range && "text-muted-foreground")}>
              <CalendarIcon className="h-4 w-4" />
              {rangeLabel}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              selected={range}
              onSelect={setRange}
              numberOfMonths={2}
              locale={ptBR}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>
        <Button variant="ghost" size="sm" onClick={() => setPreset(7)}>7d</Button>
        <Button variant="ghost" size="sm" onClick={() => setPreset(30)}>30d</Button>
        <Button variant="ghost" size="sm" onClick={() => setPreset(90)}>90d</Button>
        <Button variant="ghost" size="sm" onClick={() => setRange(undefined)} className="gap-1">
          <X className="h-3 w-3" /> Tudo
        </Button>
      </div>

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
          <p className="rounded-md border border-dashed py-12 text-center text-sm text-muted-foreground">Nenhum projeto no período.</p>
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
            Nenhuma tarefa concluída com agendamento no período.
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

// Recalcula métricas por projeto / ofensoras a partir de um subconjunto de tarefas
function computeAllMetrics(tasks: any[], projects: any[]) {
  const activeTasks = tasks.filter((t) => t.ativo);

  const buildFor = (predicate: (t: any) => boolean) => {
    const subset = activeTasks.filter(predicate);
    const completed = subset.filter((t) => t.estado === "concluída");
    const canceled = subset.filter((t) => t.estado === "cancelada");
    const open = subset.filter((t) => t.estado === "aberta");
    const scheduled = subset.filter((t) => t.estado === "agendada");
    const tempo_gasto_total = parseFloat(
      completed.reduce((s, t) => s + (t.tempo_gasto || 0), 0).toFixed(2)
    );
    const total_replanejamentos = subset.reduce(
      (s, t) => s + (t.historico_replanejamentos || 0),
      0
    );
    return {
      tempo_gasto_total,
      tarefas_concluidas: completed.length,
      tarefas_canceladas: canceled.length,
      tarefas_abertas: open.length,
      tarefas_agendadas: scheduled.length,
      total_replanejamentos,
    };
  };

  const por_projeto = projects
    .filter((p) => p.ativo)
    .map((p) => ({
      projeto_id: p.id,
      projeto_nome: p.nome,
      projeto_cor: p.cor,
      ...buildFor((t) => t.projeto_id === p.id),
    }))
    .filter((m) =>
      m.tempo_gasto_total > 0 ||
      m.tarefas_concluidas + m.tarefas_canceladas + m.tarefas_abertas + m.tarefas_agendadas > 0
    );

  const ofensoras = { projeto_id: "ofensoras", ...buildFor((t) => !t.projeto_id) };

  return { por_projeto, ofensoras };
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
