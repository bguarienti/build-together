import { useState } from "react";
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";
import { ChevronLeft, ChevronRight, X, GripVertical, AlertTriangle } from "lucide-react";
import { useAppContext } from "@/hooks/useAppContext";
import { getWeekDates, getWeekRange, addDays, HOURS, formatTime, formatDate, formatDateBR, getDayNameShort, isToday } from "@/utils/date";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function CalendarView() {
  const { state, getTasks, getProjects, getTaskTypes, addSchedule, rescheduleTask, unscheduleTask } = useAppContext();
  const [currentWeek, setCurrentWeek] = useState<Date>(new Date());

  const weekDates = getWeekDates(currentWeek);
  const projects = getProjects();
  const taskTypes = getTaskTypes();
  const openTasks = getTasks().filter((t: any) => t.estado === "aberta");

  const getProjectColor = (projectId: string | null) =>
    projects.find((p: any) => p.id === projectId)?.cor || "hsl(var(--muted-foreground))";

  const handleDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination || !destination.droppableId.startsWith("timeslot-")) return;

    const parts = destination.droppableId.split("-");
    const date = `${parts[1]}-${parts[2]}-${parts[3]}`;
    const hour = parseInt(parts[4], 10);
    const hora_inicio = formatTime(hour);
    const hora_fim = formatTime(hour + 1);

    try {
      if (source.droppableId === "tasks-list") {
        addSchedule(draggableId, date, hora_inicio, hora_fim);
        toast.success("Tarefa agendada");
      } else if (source.droppableId.startsWith("timeslot-")) {
        const [, tarefa_id] = draggableId.split("_");
        rescheduleTask(tarefa_id, date, hora_inicio, hora_fim);
        toast.success("Tarefa replanejada");
      }
    } catch (err: any) {
      toast.error(err.message ?? "Erro ao agendar");
    }
  };

  const handleUnschedule = (tarefa_id: string, nome: string) => {
    if (window.confirm(`Remover "${nome}" do calendário?`)) {
      unscheduleTask(tarefa_id);
      toast.success("Desagendada");
    }
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid h-[calc(100vh-6.5rem)] gap-4 lg:grid-cols-[280px_1fr]">
        {/* Sidebar de tarefas abertas */}
        <aside className="flex min-h-0 flex-col rounded-lg border bg-card">
          <div className="border-b p-3">
            <p className="text-sm font-semibold">Tarefas abertas</p>
            <p className="text-xs text-muted-foreground">{openTasks.length} para agendar</p>
          </div>
          <Droppable droppableId="tasks-list" type="SCHEDULE">
            {(provided, snapshot) => (
              <ScrollArea className="flex-1">
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={cn("space-y-2 p-3", snapshot.isDraggingOver && "bg-primary/5")}
                >
                  {openTasks.length === 0 ? (
                    <p className="rounded-md border border-dashed py-6 text-center text-xs text-muted-foreground">
                      Sem tarefas abertas
                    </p>
                  ) : (
                    openTasks.map((task: any, index: number) => {
                      const project = projects.find((p: any) => p.id === task.projeto_id);
                      const type = task.task_type_id ? taskTypes.find((t: any) => t.id === task.task_type_id) : null;
                      const isOffender = !task.projeto_id;
                      return (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(p, snap) => (
                            <div
                              ref={p.innerRef}
                              {...p.draggableProps}
                              {...p.dragHandleProps}
                              className={cn(
                                "group flex items-start gap-2 rounded-md border bg-background p-2 text-sm shadow-sm transition",
                                snap.isDragging && "ring-2 ring-primary",
                                isOffender && "border-destructive/40"
                              )}
                            >
                              <div className="w-1 self-stretch rounded" style={{ backgroundColor: getProjectColor(task.projeto_id) }} />
                              <GripVertical className="mt-0.5 h-3.5 w-3.5 text-muted-foreground opacity-0 transition group-hover:opacity-100" />
                              <div className="flex-1 space-y-1">
                                <p className="font-medium leading-tight">{task.nome}</p>
                                <div className="flex flex-wrap items-center gap-1">
                                  {project && <Badge variant="outline" className="h-4 px-1 text-[10px]">{project.nome}</Badge>}
                                  {type && (
                                    <Badge style={{ backgroundColor: type.cor }} className="h-4 px-1 text-[10px] text-white">
                                      {type.nome}
                                    </Badge>
                                  )}
                                  {isOffender && (
                                    <span className="flex items-center gap-0.5 text-[10px] text-destructive">
                                      <AlertTriangle className="h-3 w-3" /> sem projeto
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      );
                    })
                  )}
                  {provided.placeholder}
                </div>
              </ScrollArea>
            )}
          </Droppable>
        </aside>

        {/* Grid de calendário */}
        <div className="flex min-h-0 flex-col rounded-lg border bg-card">
          <div className="flex items-center justify-between gap-2 border-b p-3">
            <Button variant="outline" size="sm" onClick={() => setCurrentWeek(addDays(currentWeek, -7))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold">{getWeekRange(currentWeek)}</p>
              <Button variant="ghost" size="sm" onClick={() => setCurrentWeek(new Date())}>
                Hoje
              </Button>
            </div>
            <Button variant="outline" size="sm" onClick={() => setCurrentWeek(addDays(currentWeek, 7))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <ScrollArea className="flex-1">
            <div className="grid grid-cols-[60px_repeat(7,minmax(0,1fr))]">
              {/* Header dos dias */}
              <div className="sticky top-0 z-10 border-b border-r bg-card" />
              {weekDates.map((date) => {
                const today = isToday(date);
                return (
                  <div
                    key={date.toISOString()}
                    className={cn(
                      "sticky top-0 z-10 border-b border-r bg-card p-2 text-center",
                      today && "bg-primary/5"
                    )}
                  >
                    <p className="text-xs uppercase text-muted-foreground">{getDayNameShort(date)}</p>
                    <p className={cn("text-sm font-semibold", today && "text-primary")}>{formatDateBR(date)}</p>
                  </div>
                );
              })}

              {/* Linhas de hora */}
              {HOURS.map((hour) => (
                <div key={`row-${hour}`} className="contents">
                  <div className="border-b border-r p-1 text-right text-[10px] text-muted-foreground">
                    {formatTime(hour)}
                  </div>
                  {weekDates.map((date) => {
                    const dateStr = formatDate(date);
                    const daySchedules = state.schedules.filter(
                      (s: any) => s.ativo && s.data === dateStr && parseInt(s.hora_inicio.split(":")[0], 10) === hour
                    );
                    return (
                      <Droppable
                        key={`${dateStr}-${hour}`}
                        droppableId={`timeslot-${dateStr}-${hour}`}
                        type="SCHEDULE"
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className={cn(
                              "relative min-h-[56px] border-b border-r p-1 transition-colors",
                              snapshot.isDraggingOver && "bg-primary/10",
                              isToday(date) && "bg-primary/[0.02]"
                            )}
                          >
                            {daySchedules.map((s: any, idx: number) => {
                              const task = state.tasks.find((t: any) => t.id === s.tarefa_id);
                              if (!task) return null;
                              const type = task.task_type_id ? taskTypes.find((tt: any) => tt.id === task.task_type_id) : null;
                              const color = type?.cor || getProjectColor(task.projeto_id);
                              return (
                                <Draggable key={s.id} draggableId={`schedule_${task.id}_${s.id}`} index={idx}>
                                  {(p, snap) => (
                                    <div
                                      ref={p.innerRef}
                                      {...p.draggableProps}
                                      {...p.dragHandleProps}
                                      className={cn(
                                        "group mb-1 rounded-md border-l-4 bg-background p-1.5 text-[11px] shadow-sm transition",
                                        snap.isDragging && "ring-2 ring-primary"
                                      )}
                                      style={{ borderLeftColor: color, ...p.draggableProps.style }}
                                    >
                                      <div className="flex items-start justify-between gap-1">
                                        <div className="min-w-0 flex-1">
                                          <p className="truncate font-medium leading-tight">{task.nome}</p>
                                          <p className="font-mono text-[10px] text-muted-foreground">
                                            {s.hora_inicio}–{s.hora_fim}
                                          </p>
                                        </div>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleUnschedule(task.id, task.nome);
                                          }}
                                          className="opacity-0 transition group-hover:opacity-100"
                                        >
                                          <X className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </Draggable>
                              );
                            })}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    );
                  })}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </DragDropContext>
  );
}
