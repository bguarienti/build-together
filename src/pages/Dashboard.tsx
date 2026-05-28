import { useState } from "react";
import { Link } from "react-router-dom";
import { useAppContext } from "@/hooks/useAppContext";
import { Topbar } from "@/components/app/Topbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, AlertTriangle, CheckCircle2, Clock, ListTodo, FolderKanban, ArrowRight, ListChecks } from "lucide-react";
import { formatDate, formatDateBR, addDays, getWeekDates } from "@/utils/date";
import { cn } from "@/lib/utils";

const STATE_VARIANT: Record<string, { label: string; className: string }> = {
  aberta: { label: "Aberta", className: "bg-slate-100 text-slate-700" },
  agendada: { label: "Agendada", className: "bg-blue-100 text-blue-700" },
  "concluída": { label: "Concluída", className: "bg-emerald-100 text-emerald-700" },
  cancelada: { label: "Cancelada", className: "bg-zinc-100 text-zinc-500 line-through" },
};

export function Dashboard() {
  const { getTasks, getProjects, getOffenderTasks, state, getTodosByDeadline } = useAppContext();
  const tasks = getTasks();
  const projects = getProjects();
  const offenders = getOffenderTasks();

  const today = formatDate(new Date());
  const [periodo, setPeriodo] = useState<"hoje" | "amanha" | "semana">("hoje");

  const todayDate = new Date();
  const todayStr = formatDate(todayDate);
  const tomorrowStr = formatDate(addDays(todayDate, 1));
  const weekDates = getWeekDates(todayDate).map(formatDate);
  const restOfWeekDates = weekDates.filter((d) => d !== todayStr && d !== tomorrowStr);

  const dateFilter =
    periodo === "hoje"
      ? [todayStr]
      : periodo === "amanha"
      ? [tomorrowStr]
      : restOfWeekDates;

  const filteredSchedules = state.schedules
    .filter((s: any) => s.ativo && dateFilter.includes(s.data))
    .sort((a: any, b: any) => a.data.localeCompare(b.data) || a.hora_inicio.localeCompare(b.hora_inicio));

  const filteredTodos = state.todos.filter(
    (td: any) => td.ativo && td.estado === "aberta" && dateFilter.includes(td.prazo)
  );

  const periodoLabel =
    periodo === "hoje"
      ? "Hoje"
      : periodo === "amanha"
      ? "Amanhã"
      : "Resto da Semana";

  const stats = {
    open: tasks.filter((t: any) => t.estado === "aberta").length,
    scheduled: tasks.filter((t: any) => t.estado === "agendada").length,
    completed: tasks.filter((t: any) => t.estado === "concluída").length,
    canceled: tasks.filter((t: any) => t.estado === "cancelada").length,
  };

  const totalHoursCompleted = tasks
    .filter((t: any) => t.estado === "concluída")
    .reduce((sum: number, t: any) => sum + (t.tempo_gasto || 0), 0);

  return (
    <>
      <Topbar title="Dashboard" description={`Hoje, ${formatDateBR(new Date())}`} />
      <div className="flex-1 space-y-6 p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard icon={ListTodo} label="Tarefas abertas" value={stats.open} hint="aguardando agendamento" />
          <KpiCard icon={CalendarDays} label="Agendadas" value={stats.scheduled} hint="na agenda" />
          <KpiCard icon={CheckCircle2} label="Concluídas" value={stats.completed} hint={`${totalHoursCompleted.toFixed(1)}h registradas`} />
          <KpiCard icon={FolderKanban} label="Projetos ativos" value={projects.length} hint={`${state.taskTypes.filter((t: any) => t.ativo).length} tipos`} />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Clock className="h-4 w-4 text-primary" />
                  Agenda — {periodoLabel}
                </CardTitle>
                <CardDescription>{filteredSchedules.length} bloco(s) + {filteredTodos.length} TODO(s)</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex rounded-md border bg-muted p-0.5">
                  <Button
                    variant={periodo === "hoje" ? "secondary" : "ghost"}
                    size="sm"
                    className="h-7 text-xs px-2"
                    onClick={() => setPeriodo("hoje")}
                  >
                    Hoje
                  </Button>
                  <Button
                    variant={periodo === "amanha" ? "secondary" : "ghost"}
                    size="sm"
                    className="h-7 text-xs px-2"
                    onClick={() => setPeriodo("amanha")}
                  >
                    Amanhã
                  </Button>
                  <Button
                    variant={periodo === "semana" ? "secondary" : "ghost"}
                    size="sm"
                    className="h-7 text-xs px-2"
                    onClick={() => setPeriodo("semana")}
                  >
                    Resto da Semana
                  </Button>
                </div>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/calendar">
                    Abrir calendário <ArrowRight className="ml-1 h-3 w-3" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {todaySchedules.length === 0 && todayTodos.length === 0 ? (
                <p className="rounded-md border border-dashed py-8 text-center text-sm text-muted-foreground">
                  Nada agendado para hoje.
                </p>
              ) : (
                <ul className="space-y-2">
                  {todaySchedules.map((s: any) => {
                    const task = state.tasks.find((t: any) => t.id === s.tarefa_id);
                    const project = projects.find((p: any) => p.id === task?.projeto_id);
                    const type = task?.task_type_id ? state.taskTypes.find((t: any) => t.id === task.task_type_id) : null;
                    return (
                      <li key={s.id} className="flex items-center gap-3 rounded-md border bg-card p-3">
                        <div className="w-1 self-stretch rounded" style={{ backgroundColor: project?.cor || "hsl(var(--muted-foreground))" }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{task?.nome ?? "(tarefa removida)"}</p>
                          <div className="flex flex-wrap items-center gap-1 mt-0.5">
                            {project && <span className="text-xs text-muted-foreground">{project.nome}</span>}
                            {type && (
                              <Badge style={{ backgroundColor: type.cor }} className="h-3.5 px-1 text-[9px] text-white leading-none">
                                {type.nome}
                              </Badge>
                            )}
                            {task && (
                              <Badge variant="secondary" className={cn("h-3.5 px-1 text-[9px] leading-none", STATE_VARIANT[task.estado]?.className)}>
                                {STATE_VARIANT[task.estado]?.label ?? task.estado}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Badge variant="outline" className="font-mono text-xs shrink-0">
                          {s.hora_inicio}–{s.hora_fim}
                        </Badge>
                      </li>
                    );
                  })}
                  {todayTodos.map((td: any) => {
                    const linkedTask = td.tarefa_id ? state.tasks.find((t: any) => t.id === td.tarefa_id) : null;
                    const project = linkedTask ? projects.find((p: any) => p.id === linkedTask.projeto_id) : null;
                    return (
                      <li key={td.id} className="flex items-center gap-3 rounded-md border border-dashed bg-card p-3">
                        <ListChecks className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{td.titulo}</p>
                          <div className="flex flex-wrap items-center gap-1 mt-0.5">
                            {linkedTask && <span className="text-xs text-muted-foreground">{linkedTask.nome}</span>}
                            {project && (
                              <Badge style={{ backgroundColor: project.cor }} className="h-3.5 px-1 text-[9px] text-white leading-none">
                                {project.nome}
                              </Badge>
                            )}
                            <Badge variant="secondary" className="h-3.5 px-1 text-[9px] leading-none bg-amber-100 text-amber-700">
                              TODO
                            </Badge>
                          </div>
                        </div>
                        <Badge variant="outline" className="font-mono text-xs shrink-0">
                          Prazo hoje
                        </Badge>
                      </li>
                    );
                  })}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                Ofensoras
              </CardTitle>
              <CardDescription>Tarefas abertas sem projeto</CardDescription>
            </CardHeader>
            <CardContent>
              {offenders.length === 0 ? (
                <p className="rounded-md border border-dashed py-8 text-center text-sm text-muted-foreground">
                  Tudo categorizado 🎉
                </p>
              ) : (
                <ul className="space-y-1.5">
                  {offenders.slice(0, 6).map((t: any) => (
                    <li key={t.id} className="flex items-center gap-2 rounded-md bg-destructive/5 px-2 py-1.5 text-sm">
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-destructive" />
                      <span className="truncate">{t.nome}</span>
                    </li>
                  ))}
                  {offenders.length > 6 && (
                    <li className="pt-1 text-xs text-muted-foreground">+ {offenders.length - 6} mais</li>
                  )}
                </ul>
              )}
              <Button asChild variant="outline" size="sm" className="mt-3 w-full">
                <Link to="/tasks">Gerenciar tarefas</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-2 text-xs text-muted-foreground sm:grid-cols-4">
          <span>Abertas: {stats.open}</span>
          <span>Agendadas: {stats.scheduled}</span>
          <span>Concluídas: {stats.completed}</span>
          <span>Canceladas: {stats.canceled}</span>
        </div>
      </div>
    </>
  );
}

function KpiCard({ icon: Icon, label, value, hint }: { icon: any; label: string; value: number; hint?: string }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
          <Icon className="h-5 w-5 text-foreground" />
        </div>
        <div className="flex-1">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-2xl font-semibold leading-tight">{value}</p>
          {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
