import { createFileRoute, Link } from "@tanstack/react-router";
import { useAppContext } from "@/hooks/useAppContext";
import { Topbar } from "@/components/app/Topbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, AlertTriangle, CheckCircle2, Clock, ListTodo, FolderKanban, ArrowRight } from "lucide-react";
import { formatDate, formatDateBR } from "@/utils/date";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Dashboard — Time Blocking" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { getTasks, getProjects, getOffenderTasks, state } = useAppContext();
  const tasks = getTasks();
  const projects = getProjects();
  const offenders = getOffenderTasks();

  const today = formatDate(new Date());
  const todaySchedules = state.schedules
    .filter((s: any) => s.ativo && s.data === today)
    .sort((a: any, b: any) => a.hora_inicio.localeCompare(b.hora_inicio));

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
        {/* KPIs */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard icon={ListTodo} label="Tarefas abertas" value={stats.open} hint="aguardando agendamento" />
          <KpiCard icon={CalendarDays} label="Agendadas" value={stats.scheduled} hint="na agenda" />
          <KpiCard icon={CheckCircle2} label="Concluídas" value={stats.completed} hint={`${totalHoursCompleted.toFixed(1)}h registradas`} />
          <KpiCard icon={FolderKanban} label="Projetos ativos" value={projects.length} hint={`${state.taskTypes.filter((t: any) => t.ativo).length} tipos`} />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Hoje */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Clock className="h-4 w-4 text-primary" />
                  Agenda de hoje
                </CardTitle>
                <CardDescription>{todaySchedules.length} bloco(s) agendado(s)</CardDescription>
              </div>
              <Button asChild variant="ghost" size="sm">
                <Link to="/calendar">
                  Abrir calendário <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {todaySchedules.length === 0 ? (
                <p className="rounded-md border border-dashed py-8 text-center text-sm text-muted-foreground">
                  Nada agendado para hoje.
                </p>
              ) : (
                <ul className="space-y-2">
                  {todaySchedules.map((s: any) => {
                    const task = state.tasks.find((t: any) => t.id === s.tarefa_id);
                    const project = projects.find((p: any) => p.id === task?.projeto_id);
                    return (
                      <li key={s.id} className="flex items-center gap-3 rounded-md border bg-card p-3">
                        <div className="w-1 self-stretch rounded" style={{ backgroundColor: project?.cor || "hsl(var(--muted-foreground))" }} />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{task?.nome ?? "(tarefa removida)"}</p>
                          {project && <p className="text-xs text-muted-foreground">{project.nome}</p>}
                        </div>
                        <Badge variant="outline" className="font-mono text-xs">
                          {s.hora_inicio}–{s.hora_fim}
                        </Badge>
                      </li>
                    );
                  })}
                </ul>
              )}
            </CardContent>
          </Card>

          {/* Ofensoras */}
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
      </div>
    </>
  );
}

function KpiCard({ icon: Icon, label, value, hint }: any) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className="text-2xl font-semibold leading-tight">{value}</p>
          {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
