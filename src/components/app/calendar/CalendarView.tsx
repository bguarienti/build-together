import { useState } from "react";
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";
import { ChevronLeft, ChevronRight, X, GripVertical, AlertTriangle, Plus, ChevronUp, ChevronDown } from "lucide-react";
import { useAppContext } from "@/hooks/useAppContext";
import {
  getWeekDates, getWeekRange, addDays, SLOTS, SLOT_MINUTES,
  formatTime, formatDate, formatDateBR, getDayNameShort, isToday,
  parseTime, minutesToTime,
} from "@/utils/date";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type NewSlot = { date: string; startMin: number } | null;

// height per 15-min slot, in px
const SLOT_H = 16;

export function CalendarView() {
  const { state, getTasks, getProjects, getTaskTypes, addTask, addSchedule, rescheduleTask, unscheduleTask } = useAppContext();
  const [currentWeek, setCurrentWeek] = useState<Date>(new Date());
  const [newSlot, setNewSlot] = useState<NewSlot>(null);
  const [name, setName] = useState("");
  const [projectId, setProjectId] = useState<string>("none");
  const [typeId, setTypeId] = useState<string>("none");
  const [durationMin, setDurationMin] = useState<number>(60);
  const [isMinimized, setIsMinimized] = useState(false);

  const weekDates = getWeekDates(currentWeek);
  const projects = getProjects();
  const taskTypes = getTaskTypes();
  const openTasks = getTasks().filter((t: any) => t.estado === "aberta");

  const getProjectColor = (projectId: string | null) =>
    projects.find((p: any) => p.id === projectId)?.cor || "hsl(var(--muted-foreground))";

  const openNewSlot = (date: string, startMin: number) => {
    setNewSlot({ date, startMin });
    setName("");
    setProjectId("none");
    setTypeId("none");
    setDurationMin(60);
  };

  const submitNewSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSlot) return;
    try {
      const task = addTask(name.trim(), projectId === "none" ? null : projectId, typeId === "none" ? null : typeId);
      const start = newSlot.startMin;
      const end = Math.min(start + Math.max(SLOT_MINUTES, durationMin), 24 * 60);
      addSchedule(task.id, newSlot.date, minutesToTime(start), minutesToTime(end));
      toast.success("Tarefa criada e agendada");
      setNewSlot(null);
    } catch (err: any) {
      toast.error(err.message ?? "Erro ao criar");
    }
  };

  const handleDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination || !destination.droppableId.startsWith("timeslot-")) return;

    // droppableId: timeslot-YYYY-MM-DD-<startMin>
    const parts = destination.droppableId.split("-");
    const date = `${parts[1]}-${parts[2]}-${parts[3]}`;
    const startMin = parseInt(parts[4], 10);

    try {
      if (source.droppableId === "tasks-list") {
        // default 1h for dragged open task
        addSchedule(draggableId, date, minutesToTime(startMin), minutesToTime(startMin + 60));
        toast.success("Tarefa agendada");
      } else if (source.droppableId.startsWith("timeslot-")) {
        // preserve original duration
        const [, tarefa_id, scheduleId] = draggableId.split("_");
        const sch = state.schedules.find((s: any) => s.id === scheduleId && s.ativo);
        const dur = sch ? parseTime(sch.hora_fim) - parseTime(sch.hora_inicio) : 60;
        rescheduleTask(tarefa_id, date, minutesToTime(startMin), minutesToTime(startMin + dur));
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
      <div className="flex h-[calc(100vh-6.5rem)] flex-col gap-4">
        {/* Faixa horizontal de tarefas abertas */}
        <section className={cn("flex flex-col rounded-lg border bg-card transition-all", isMinimized ? "shrink-0" : "")}>
          <div className="flex items-center justify-between gap-3 border-b px-3 py-2">
            <div>
              <p className="text-sm font-semibold">Tarefas abertas</p>
              <p className="text-[11px] text-muted-foreground">
                {openTasks.length} para agendar · arraste para o calendário ou clique num horário vazio
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setIsMinimized((v) => !v)} className="h-7 w-7 p-0">
              {isMinimized ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </Button>
          </div>
          {!isMinimized && (
            <Droppable droppableId="tasks-list" type="SCHEDULE" direction="horizontal">
              {(provided, snapshot) => (
                <ScrollArea className="w-full">
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={cn(
                      "flex gap-2 p-3",
                      snapshot.isDraggingOver && "bg-primary/5"
                    )}
                  >
                    {openTasks.length === 0 ? (
                      <p className="w-full rounded-md border border-dashed py-4 text-center text-xs text-muted-foreground">
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
                                  "group flex w-56 shrink-0 items-start gap-2 rounded-md border bg-background p-2 text-sm shadow-sm transition",
                                  snap.isDragging && "ring-2 ring-primary",
                                  isOffender && "border-destructive/40"
                                )}
                              >
                                <div className="w-1 self-stretch rounded" style={{ backgroundColor: getProjectColor(task.projeto_id) }} />
                                <GripVertical className="mt-0.5 h-3.5 w-3.5 text-muted-foreground opacity-0 transition group-hover:opacity-100" />
                                <div className="min-w-0 flex-1 space-y-1">
                                  <p className="truncate font-medium leading-tight">{task.nome}</p>
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
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              )}
            </Droppable>
          )}
        </section>

        {/* Grid de calendário */}
        <div className="flex min-h-0 flex-1 flex-col rounded-lg border bg-card">
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

              {/* Linhas de 15 minutos */}
              {SLOTS.map(({ hour, minute }) => {
                const startMin = hour * 60 + minute;
                const isHourStart = minute === 0;
                return (
                  <div key={`row-${startMin}`} className="contents">
                    <div
                      className={cn(
                        "border-r px-1 text-right text-[10px] text-muted-foreground",
                        isHourStart ? "border-b" : "border-b border-dashed border-border/40"
                      )}
                      style={{ height: SLOT_H }}
                    >
                      {isHourStart ? formatTime(hour) : ""}
                    </div>
                    {weekDates.map((date) => {
                      const dateStr = formatDate(date);
                      // Find schedule that STARTS at this exact slot
                      const startingHere = state.schedules.filter(
                        (s: any) => s.ativo && s.data === dateStr && parseTime(s.hora_inicio) === startMin
                      );
                      // Is this slot covered by another schedule (started earlier, still running)?
                      const isOccupied = state.schedules.some(
                        (s: any) =>
                          s.ativo &&
                          s.data === dateStr &&
                          parseTime(s.hora_inicio) < startMin &&
                          parseTime(s.hora_fim) > startMin
                      );
                      const isEmpty = startingHere.length === 0 && !isOccupied;
                      return (
                        <Droppable
                          key={`${dateStr}-${startMin}`}
                          droppableId={`timeslot-${dateStr}-${startMin}`}
                          type="SCHEDULE"
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                              onClick={() => isEmpty && openNewSlot(dateStr, startMin)}
                              className={cn(
                                "group/slot relative border-r transition-colors",
                                isHourStart ? "border-b" : "border-b border-dashed border-border/40",
                                isEmpty && "cursor-pointer hover:bg-primary/5",
                                snapshot.isDraggingOver && "bg-primary/10",
                                isToday(date) && "bg-primary/[0.02]"
                              )}
                              style={{ height: SLOT_H }}
                            >
                              {startingHere.map((s: any, idx: number) => {
                                const task = state.tasks.find((t: any) => t.id === s.tarefa_id);
                                if (!task) return null;
                                const type = task.task_type_id ? taskTypes.find((tt: any) => tt.id === task.task_type_id) : null;
                                const color = type?.cor || getProjectColor(task.projeto_id);
                                const dur = parseTime(s.hora_fim) - parseTime(s.hora_inicio);
                                const blockH = Math.max(SLOT_H, (dur / SLOT_MINUTES) * SLOT_H) - 2;
                                return (
                                  <Draggable key={s.id} draggableId={`schedule_${task.id}_${s.id}`} index={idx}>
                                    {(p, snap) => (
                                      <div
                                        ref={p.innerRef}
                                        {...p.draggableProps}
                                        {...p.dragHandleProps}
                                        onClick={(e) => e.stopPropagation()}
                                        className={cn(
                                          "group absolute inset-x-0.5 z-10 overflow-hidden rounded-md border-l-4 bg-background px-1.5 py-1 text-[11px] shadow-sm transition",
                                          snap.isDragging && "ring-2 ring-primary"
                                        )}
                                        style={{
                                          top: 1,
                                          height: snap.isDragging ? undefined : blockH,
                                          borderLeftColor: color,
                                          ...p.draggableProps.style,
                                        }}
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
                              {isEmpty && (
                                <div className="pointer-events-none flex h-full items-center justify-center opacity-0 transition group-hover/slot:opacity-100">
                                  <Plus className="h-3 w-3 text-muted-foreground" />
                                </div>
                              )}
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      </div>

      <Dialog open={!!newSlot} onOpenChange={(o) => !o && setNewSlot(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova tarefa agendada</DialogTitle>
            <DialogDescription>
              {newSlot && `${formatDateBR(new Date(newSlot.date + "T00:00:00"))} às ${minutesToTime(newSlot.startMin)}`}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submitNewSlot} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="ns-name">Nome</Label>
              <Input id="ns-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Revisar proposta" autoFocus maxLength={255} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Projeto</Label>
                <Select value={projectId} onValueChange={setProjectId}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sem projeto</SelectItem>
                    {projects.map((p: any) => <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Tipo</Label>
                <Select value={typeId} onValueChange={setTypeId}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sem tipo</SelectItem>
                    {taskTypes.map((t: any) => <SelectItem key={t.id} value={t.id}>{t.nome}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Duração</Label>
              <Select value={String(durationMin)} onValueChange={(v) => setDurationMin(parseInt(v, 10))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[15, 30, 45, 60, 75, 90, 105, 120, 150, 180, 240].map((m) => (
                    <SelectItem key={m} value={String(m)}>
                      {m < 60 ? `${m} min` : m % 60 === 0 ? `${m / 60} h` : `${Math.floor(m / 60)}h ${m % 60}min`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setNewSlot(null)}>Cancelar</Button>
              <Button type="submit">Criar e agendar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DragDropContext>
  );
}
