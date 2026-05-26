import { useEffect, useState } from "react";
import { format } from "date-fns";
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";
import { ChevronLeft, ChevronRight, X, GripVertical, AlertTriangle, Plus, ChevronUp, ChevronDown, CheckCircle2, XCircle, RotateCcw, Trash2, Check, Ban, ClipboardList, CalendarIcon } from "lucide-react";
import { Link } from "react-router-dom";
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
import { Textarea } from "@/components/ui/textarea";
import { HoursMinutesInput, toDecimalHours } from "@/components/app/HoursMinutesInput";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";


type NewSlot = { date: string; startMin: number } | null;

// height per 15-min slot, in px
const SLOT_H = 16;

export function CalendarView() {
  const { state, getTasks, getProjects, getTaskTypes, addTask, addSchedule, rescheduleTask, unscheduleTask, completeTask, cancelTask, reopenTask, deleteTask, updateTask, getTodosByDeadline, getTodosByTask, addTodo, completeTodo, deleteTodo } = useAppContext();
  const [currentWeek, setCurrentWeek] = useState<Date>(new Date());
  const [newSlot, setNewSlot] = useState<NewSlot>(null);
  const [name, setName] = useState("");
  const [projectId, setProjectId] = useState<string>("none");
  const [typeId, setTypeId] = useState<string>("none");
  const [durationMin, setDurationMin] = useState<number>(60);
  const [isMinimized, setIsMinimized] = useState(false);
  const [tasksExpanded, setTasksExpanded] = useState(false);
  const [actionTask, setActionTask] = useState<any | null>(null);
  const [completeOpen, setCompleteOpen] = useState(false);
  const [tempoH, setTempoH] = useState("");
  const [tempoM, setTempoM] = useState("");
  const [notes, setNotes] = useState("");
  const [calTodoTitle, setCalTodoTitle] = useState("");
  const [calTodoDate, setCalTodoDate] = useState<Date | undefined>(undefined);

  useEffect(() => {
    setNotes(actionTask?.anotacoes ?? "");
  }, [actionTask?.id]);

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
      const end = Math.min(start + Math.max(SLOT_MINUTES, durationMin), 19 * 60);
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
        {/* Grid de calendário */}
        <div className="flex min-h-0 flex-1 flex-col rounded-lg border bg-card">
          <div className="flex items-center justify-between gap-2 border-b p-3">
            <Droppable droppableId="tasks-list" type="SCHEDULE" direction="horizontal" isDropDisabled>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="flex min-w-0 flex-1 flex-wrap items-center gap-2"
                >
                  {openTasks.length === 0 ? (
                    <span className="text-xs text-muted-foreground">Sem tarefas abertas</span>
                  ) : (
                    openTasks.map((task: any, index: number) => {
                      const project = projects.find((p: any) => p.id === task.projeto_id);
                      const type = task.task_type_id ? taskTypes.find((t: any) => t.id === task.task_type_id) : null;
                      const isOffender = !task.projeto_id;
                      const hidden = !tasksExpanded && index > 0;
                      return (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(p, snap) => (
                            <div
                              ref={p.innerRef}
                              {...p.draggableProps}
                              {...p.dragHandleProps}
                              className={cn(
                                "group flex max-w-[260px] shrink-0 items-center gap-1.5 rounded-md border bg-background px-2 py-1 text-xs shadow-sm transition",
                                snap.isDragging && "ring-2 ring-primary",
                                isOffender && "border-destructive/40",
                                hidden && !snap.isDragging && "hidden"
                              )}
                              style={p.draggableProps.style}
                            >
                              <div className="h-3 w-1 rounded" style={{ backgroundColor: getProjectColor(task.projeto_id) }} />
                              <GripVertical className="h-3 w-3 text-muted-foreground" />
                              <span className="truncate font-medium">{task.nome}</span>
                              {project && <Badge variant="outline" className="h-4 px-1 text-[10px]">{project.nome}</Badge>}
                              {type && (
                                <Badge style={{ backgroundColor: type.cor }} className="h-4 px-1 text-[10px] text-white">
                                  {type.nome}
                                </Badge>
                              )}
                              {isOffender && <AlertTriangle className="h-3 w-3 text-destructive" />}
                            </div>
                          )}
                        </Draggable>
                      );
                    })
                  )}
                  {provided.placeholder}
                  {openTasks.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-7 shrink-0 px-2"
                      onClick={() => setTasksExpanded((v) => !v)}
                      title={tasksExpanded ? "Recolher" : "Mostrar todas para arrastar"}
                    >
                      {tasksExpanded ? (
                        <>
                          <ChevronUp className="mr-1 h-3.5 w-3.5" />
                          recolher
                        </>
                      ) : (
                        <>
                          <Plus className="mr-1 h-3.5 w-3.5" />
                          {openTasks.length - 1}
                        </>
                      )}
                    </Button>
                  )}
                </div>
              )}
            </Droppable>


            <div className="flex shrink-0 items-center gap-1">
              <Button variant="outline" size="sm" onClick={() => setCurrentWeek(addDays(currentWeek, -7))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <p className="px-1 text-sm font-semibold">{getWeekRange(currentWeek)}</p>
              <Button variant="ghost" size="sm" onClick={() => setCurrentWeek(new Date())}>
                Hoje
              </Button>
              <Button variant="outline" size="sm" onClick={() => setCurrentWeek(addDays(currentWeek, 7))}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>


          <ScrollArea className="flex-1">
            <div className="grid grid-cols-[60px_repeat(7,minmax(0,1fr))]">
              {/* Header dos dias */}
              <div className="sticky top-0 z-10 border-b border-r bg-card" />
              {weekDates.map((date) => {
                const today = isToday(date);
                const dateStr = formatDate(date);
                const dueTodos = getTodosByDeadline(dateStr);
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
                    {dueTodos.length > 0 && (
                      <Link
                        to="/todos"
                        title={`${dueTodos.length} TODO(s) com prazo: ${dueTodos.map((t: any) => t.titulo).join(", ")}`}
                        className="mt-1 inline-flex items-center gap-1 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-800 hover:bg-amber-200"
                      >
                        <ClipboardList className="h-2.5 w-2.5" />
                        {dueTodos.length} TODO{dueTodos.length > 1 ? "s" : ""}
                      </Link>
                    )}
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
                        isHourStart ? "border-t" : "border-t border-dashed border-border/40"
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
                                isHourStart ? "border-t" : "border-t border-dashed border-border/40",
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
                                const isDone = task.estado === "concluída";
                                const isCanceled = task.estado === "cancelada";
                                const isInactive = isDone || isCanceled;
                                return (
                                  <Draggable key={s.id} draggableId={`schedule_${task.id}_${s.id}`} index={idx} isDragDisabled={isInactive}>
                                    {(p, snap) => (
                                      <div
                                        ref={p.innerRef}
                                        {...p.draggableProps}
                                        {...p.dragHandleProps}
                                        onClick={(e) => { e.stopPropagation(); setActionTask(task); }}
                                        className={cn(
                                          "group absolute inset-x-0.5 z-10 cursor-pointer overflow-hidden rounded-md border-l-4 bg-background px-1.5 py-1 text-[11px] shadow-sm transition hover:bg-accent/50",
                                          snap.isDragging && "ring-2 ring-primary",
                                          isDone && "opacity-60 line-through",
                                          isCanceled && "opacity-50 italic"
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
                                          <div className="flex items-center gap-1">
                                            <p className="truncate font-medium leading-tight">{task.nome}</p>
                                            {isDone && <Check className="h-3 w-3 shrink-0 text-emerald-600" />}
                                            {isCanceled && <Ban className="h-3 w-3 shrink-0 text-amber-600" />}
                                          </div>
                                          <div className="flex flex-wrap items-center gap-1">
                                            <p className="font-mono text-[10px] text-muted-foreground">
                                              {s.hora_inicio}–{s.hora_fim}
                                            </p>
                                            {type && (
                                              <Badge style={{ backgroundColor: type.cor }} className="h-3 px-1 text-[9px] text-white leading-none">
                                                {type.nome}
                                              </Badge>
                                            )}
                                            <Badge variant="secondary" className={cn("h-3 px-1 text-[9px] leading-none", STATE_VARIANT[task.estado]?.className)}>
                                              {STATE_VARIANT[task.estado]?.label ?? task.estado}
                                            </Badge>
                                          </div>
                                        </div>
                                          {!isInactive && (
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleUnschedule(task.id, task.nome);
                                              }}
                                              className="opacity-0 transition group-hover:opacity-100"
                                            >
                                              <X className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                                            </button>
                                          )}
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

      {/* Modal de ações para tarefa agendada */}
      <Dialog open={!!actionTask && !completeOpen} onOpenChange={(o) => { if (!o) { setActionTask(null); setCalTodoTitle(""); setCalTodoDate(undefined); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{actionTask?.nome}</DialogTitle>
            <DialogDescription>
              {actionTask && `Estado: ${actionTask.estado}`}
            </DialogDescription>
          </DialogHeader>

          {actionTask && (
            <div className="space-y-1.5">
              <Label htmlFor="cal-notes">Anotações</Label>
              <Textarea
                id="cal-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                onBlur={() => {
                  if ((actionTask.anotacoes ?? "") !== notes) {
                    updateTask(actionTask.id, { anotacoes: notes });
                  }
                }}
                rows={3}
                maxLength={2000}
                placeholder="Notas, contexto, links…"
              />
            </div>
          )}

          {actionTask && (
            <div className="space-y-2 rounded-md border bg-muted/30 p-3">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <ClipboardList className="h-4 w-4" /> TODOs desta tarefa
              </div>

              <div className="space-y-1">
                {getTodosByTask(actionTask.id).length === 0 && (
                  <p className="text-xs text-muted-foreground">Nenhum TODO ainda.</p>
                )}
                {getTodosByTask(actionTask.id).map((td: any) => (
                  <div key={td.id} className="flex items-center gap-2 rounded border bg-background px-2 py-1 text-sm">
                    <button
                      type="button"
                      onClick={() => { completeTodo(td.id); toast.success("TODO concluído"); }}
                      disabled={td.estado !== "aberta"}
                      className="text-muted-foreground hover:text-emerald-600 disabled:opacity-40"
                    >
                      <CheckCircle2 className={cn("h-4 w-4", td.estado === "concluída" && "text-emerald-600")} />
                    </button>
                    <span className={cn("flex-1", td.estado === "concluída" && "line-through text-muted-foreground", td.estado === "cancelada" && "line-through text-muted-foreground italic")}>
                      {td.titulo}
                    </span>
                    {td.prazo && (
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {format(new Date(td.prazo + "T00:00:00"), "dd/MM")}
                      </span>
                    )}
                    <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => { deleteTodo(td.id); }}>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-2">
                <Input
                  value={calTodoTitle}
                  onChange={(e) => setCalTodoTitle(e.target.value)}
                  placeholder="Novo TODO..."
                  className="h-8 flex-1 min-w-[180px]"
                  maxLength={255}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && calTodoTitle.trim() && actionTask) {
                      e.preventDefault();
                      try {
                        addTodo(actionTask.id, calTodoTitle.trim(), calTodoDate ? formatDate(calTodoDate) : null);
                        setCalTodoTitle(""); setCalTodoDate(undefined);
                      } catch (err: any) { toast.error(err.message); }
                    }
                  }}
                />
                <Popover>
                  <PopoverTrigger asChild>
                    <Button type="button" variant="outline" size="sm" className="h-8">
                      <CalendarIcon className="mr-1 h-3.5 w-3.5" />
                      {calTodoDate ? format(calTodoDate, "dd/MM") : "Prazo"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <Calendar mode="single" selected={calTodoDate} onSelect={setCalTodoDate} initialFocus className={cn("p-3 pointer-events-auto")} />
                  </PopoverContent>
                </Popover>
                <Button
                  type="button"
                  size="sm"
                  className="h-8"
                  disabled={!calTodoTitle.trim()}
                  onClick={() => {
                    if (!actionTask) return;
                    try {
                      addTodo(actionTask.id, calTodoTitle.trim(), calTodoDate ? formatDate(calTodoDate) : null);
                      setCalTodoTitle(""); setCalTodoDate(undefined);
                      toast.success("TODO criado");
                    } catch (err: any) { toast.error(err.message); }
                  }}
                >
                  <Plus className="mr-1 h-3.5 w-3.5" /> TODO
                </Button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            {actionTask && (actionTask.estado === "aberta" || actionTask.estado === "agendada") && (
              <>
                <Button variant="outline" onClick={() => { setCompleteOpen(true); setTempoH(""); setTempoM(""); }}>
                  <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-600" /> Concluir
                </Button>
                <Button variant="outline" onClick={() => {
                  if (window.confirm(`Cancelar "${actionTask.nome}"?`)) {
                    cancelTask(actionTask.id); toast.success("Cancelada"); setActionTask(null);
                  }
                }}>
                  <XCircle className="mr-2 h-4 w-4 text-amber-600" /> Cancelar
                </Button>
                <Button variant="outline" onClick={() => {
                  unscheduleTask(actionTask.id); toast.success("Desagendada"); setActionTask(null);
                }}>
                  <X className="mr-2 h-4 w-4" /> Desagendar
                </Button>
              </>
            )}
            {actionTask && (actionTask.estado === "concluída" || actionTask.estado === "cancelada") && (
              <Button variant="outline" onClick={() => {
                reopenTask(actionTask.id); toast.success("Reaberta"); setActionTask(null);
              }}>
                <RotateCcw className="mr-2 h-4 w-4 text-blue-600" /> Reabrir
              </Button>
            )}
            <Button variant="outline" className="text-destructive" onClick={() => {
              if (actionTask && window.confirm(`Deletar "${actionTask.nome}"?`)) {
                deleteTask(actionTask.id); toast.success("Removida"); setActionTask(null);
              }
            }}>
              <Trash2 className="mr-2 h-4 w-4" /> Deletar
            </Button>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setActionTask(null)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de conclusão (tempo gasto) */}
      <Dialog open={completeOpen} onOpenChange={(o) => { setCompleteOpen(o); if (!o) { setTempoH(""); setTempoM(""); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Concluir tarefa</DialogTitle>
            <DialogDescription>{actionTask?.nome}</DialogDescription>
          </DialogHeader>
          <HoursMinutesInput
            hours={tempoH}
            minutes={tempoM}
            onHoursChange={setTempoH}
            onMinutesChange={setTempoM}
            idPrefix="cal-tempo"
            autoFocus
          />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setCompleteOpen(false)}>Cancelar</Button>
            <Button onClick={() => {
              try {
                const t = toDecimalHours(tempoH, tempoM);
                completeTask(actionTask.id, t);
                toast.success("Tarefa concluída");
                setCompleteOpen(false); setActionTask(null); setTempoH(""); setTempoM("");
              } catch (err: any) {
                toast.error(err.message);
              }
            }}>Concluir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DragDropContext>
  );
}
