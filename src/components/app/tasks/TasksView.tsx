import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2, CheckCircle2, XCircle, AlertTriangle, X, CalendarIcon, RotateCcw, StickyNote, ClipboardList, Pencil, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import { format } from "date-fns";

import { useAppContext } from "@/hooks/useAppContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { formatDate, parseTime, minutesToTime, SLOT_MINUTES } from "@/utils/date";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { HoursMinutesInput, toDecimalHours, formatHoursMinutes } from "@/components/app/HoursMinutesInput";

type StateFilter = "all" | "aberta" | "agendada" | "concluída" | "cancelada";
type SortKey = "name" | "project" | "type" | "state" | "schedule" | "time";
type SortDir = "asc" | "desc";


const STATE_VARIANT: Record<string, { label: string; className: string }> = {
  aberta: { label: "Aberta", className: "bg-slate-100 text-slate-700" },
  agendada: { label: "Agendada", className: "bg-blue-100 text-blue-700" },
  "concluída": { label: "Concluída", className: "bg-emerald-100 text-emerald-700" },
  cancelada: { label: "Cancelada", className: "bg-zinc-100 text-zinc-500 line-through" },
};

export function TasksView() {
  const { state, getTasks, getProjects, getTaskTypes, addTask, addSchedule, deleteTask, completeTask, cancelTask, reopenTask, updateTask, getTodosByTask, addTodo, completeTodo, deleteTodo } = useAppContext();
  const tasks = getTasks();
  const projects = getProjects();
  const types = getTaskTypes();

  const [filter, setFilter] = useState<StateFilter>("all");
  const [projFilter, setProjFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey>("schedule");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [showForm, setShowForm] = useState(false);

  const [name, setName] = useState("");
  const [projectId, setProjectId] = useState<string>("none");
  const [typeId, setTypeId] = useState<string>("none");
  const [schedule, setSchedule] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [startTime, setStartTime] = useState<string>("09:00");
  const [durationMin, setDurationMin] = useState<number>(60);
  const [completeTarget, setCompleteTarget] = useState<any | null>(null);
  const [tempoH, setTempoH] = useState("");
  const [tempoM, setTempoM] = useState("");
  const [notesTarget, setNotesTarget] = useState<any | null>(null);
  const [notes, setNotes] = useState("");
  const [newTodoTitle, setNewTodoTitle] = useState("");
  const [newTodoDate, setNewTodoDate] = useState<Date | undefined>(undefined);
  const [editTarget, setEditTarget] = useState<any | null>(null);
  const [editProjectId, setEditProjectId] = useState<string>("none");
  const [editTypeId, setEditTypeId] = useState<string>("none");

  useEffect(() => {
    setNotes(notesTarget?.anotacoes ?? "");
  }, [notesTarget?.id]);

  const timeOptions = useMemo(() => {
    const out: string[] = [];
    for (let h = 6; h <= 22; h++) {
      for (let m = 0; m < 60; m += SLOT_MINUTES) {
        out.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
      }
    }
    return out;
  }, []);

  const activeSchedulesByTask = useMemo(() => {
    const map = new Map<string, any>();
    state.schedules.forEach((s: any) => { if (s.ativo) map.set(s.tarefa_id, s); });
    return map;
  }, [state.schedules]);

  const filtered = useMemo(() => {
    const list = tasks.filter((t: any) => {
      if (filter !== "all" && t.estado !== filter) return false;
      if (projFilter === "offenders") {
        if (t.projeto_id) return false;
      } else if (projFilter !== "all" && t.projeto_id !== projFilter) return false;
      if (typeFilter === "none") {
        if (t.task_type_id) return false;
      } else if (typeFilter !== "all" && t.task_type_id !== typeFilter) return false;
      return true;
    });

    const projName = (id: string | null) => (id ? projects.find((p: any) => p.id === id)?.nome ?? "" : "");
    const typeName = (id: string | null) => (id ? types.find((tt: any) => tt.id === id)?.nome ?? "" : "");
    const scheduleSortValue = (t: any) => {
      const s = activeSchedulesByTask.get(t.id);
      if (!s) return Number.POSITIVE_INFINITY;
      return new Date(`${s.data}T${s.hora_inicio}:00`).getTime();
    };
    const stateOrder: Record<string, number> = { aberta: 0, agendada: 1, "concluída": 2, cancelada: 3 };

    const getVal = (t: any): string | number => {
      switch (sortKey) {
        case "name": return (t.nome || "").toLowerCase();
        case "project": return projName(t.projeto_id).toLowerCase();
        case "type": return typeName(t.task_type_id).toLowerCase();
        case "state": return stateOrder[t.estado] ?? 99;
        case "schedule": return scheduleSortValue(t);
        case "time": return t.tempo_gasto ?? -1;
        default: return 0;
      }
    };

    const sorted = [...list].sort((a, b) => {
      const va = getVal(a); const vb = getVal(b);
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [tasks, filter, projFilter, typeFilter, sortKey, sortDir, projects, types, activeSchedulesByTask]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };


  const resetForm = () => {
    setName(""); setProjectId("none"); setTypeId("none");
    setSchedule(false); setDate(new Date()); setStartTime("09:00"); setDurationMin(60);
    setShowForm(false);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const task = addTask(name.trim(), projectId === "none" ? null : projectId, typeId === "none" ? null : typeId);
      if (schedule) {
        if (!date) throw new Error("Selecione uma data");
        const start = parseTime(startTime);
        addSchedule(task.id, formatDate(date), startTime, minutesToTime(start + durationMin));
        toast.success("Tarefa criada e agendada");
      } else {
        toast.success("Tarefa criada");
      }
      resetForm();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleComplete = () => {
    if (!completeTarget) return;
    try {
      const t = toDecimalHours(tempoH, tempoM);
      completeTask(completeTarget.id, t);
      toast.success("Tarefa concluída");
      setCompleteTarget(null);
      setTempoH("");
      setTempoM("");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as StateFilter)}>
          <TabsList>
            <TabsTrigger value="all">Todas</TabsTrigger>
            <TabsTrigger value="aberta">Abertas</TabsTrigger>
            <TabsTrigger value="agendada">Agendadas</TabsTrigger>
            <TabsTrigger value="concluída">Concluídas</TabsTrigger>
            <TabsTrigger value="cancelada">Canceladas</TabsTrigger>
          </TabsList>
        </Tabs>
        <Select value={projFilter} onValueChange={setProjFilter}>
          <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os projetos</SelectItem>
            <SelectItem value="offenders">⚠️ Sem projeto</SelectItem>
            {projects.map((p: any) => (
              <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            <SelectItem value="none">Sem tipo</SelectItem>
            {types.map((t: any) => (
              <SelectItem key={t.id} value={t.id}>{t.nome}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button size="sm" className="ml-auto" onClick={() => setShowForm((v) => !v)}>
          {showForm ? <X className="mr-1 h-4 w-4" /> : <Plus className="mr-1 h-4 w-4" />}
          {showForm ? "Cancelar" : "Nova tarefa"}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="space-y-4 p-4">
            <form onSubmit={submit} className="space-y-4">
              <div className="grid gap-3 md:grid-cols-[2fr_1fr_1fr]">
                <div className="space-y-1.5">
                  <Label htmlFor="t-name">Nome</Label>
                  <Input id="t-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Revisar proposta" autoFocus maxLength={255} />
                </div>
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
                      {types.map((t: any) => <SelectItem key={t.id} value={t.id}>{t.nome}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  id="t-sched"
                  type="checkbox"
                  checked={schedule}
                  onChange={(e) => setSchedule(e.target.checked)}
                  className="h-4 w-4"
                />
                <Label htmlFor="t-sched" className="cursor-pointer">Agendar agora</Label>
              </div>

              {schedule && (
                <div className="grid gap-3 md:grid-cols-3">
                  <div className="space-y-1.5">
                    <Label>Data</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? format(date, "dd/MM/yyyy") : "Selecione"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          initialFocus
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Início</Label>
                    <Select value={startTime} onValueChange={setStartTime}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent className="max-h-72">
                        {timeOptions.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
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
                </div>
              )}

              <div className="flex justify-end">
                <Button type="submit">{schedule ? "Criar e agendar" : "Criar"}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <SortableHead label="Tarefa" sortKey="name" current={sortKey} dir={sortDir} onClick={toggleSort} className="w-[32%]" />
                <SortableHead label="Projeto" sortKey="project" current={sortKey} dir={sortDir} onClick={toggleSort} />
                <SortableHead label="Tipo" sortKey="type" current={sortKey} dir={sortDir} onClick={toggleSort} />
                <SortableHead label="Estado" sortKey="state" current={sortKey} dir={sortDir} onClick={toggleSort} />
                <SortableHead label="Agendamento" sortKey="schedule" current={sortKey} dir={sortDir} onClick={toggleSort} />
                <SortableHead label="Tempo" sortKey="time" current={sortKey} dir={sortDir} onClick={toggleSort} />
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>

            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="py-12 text-center text-sm text-muted-foreground">Nenhuma tarefa</TableCell></TableRow>
              ) : (
                filtered.map((task: any) => {
                  const project = projects.find((p: any) => p.id === task.projeto_id);
                  const type = task.task_type_id ? types.find((t: any) => t.id === task.task_type_id) : null;
                  const isOffender = !task.projeto_id;
                  const isActive = task.estado === "aberta" || task.estado === "agendada";
                  const schedule = state.schedules.find((s: any) => s.ativo && s.tarefa_id === task.id);
                  return (
                    <TableRow key={task.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {isOffender && <AlertTriangle className="h-3.5 w-3.5 text-destructive" />}
                          <span className={task.estado === "cancelada" ? "text-muted-foreground line-through" : "font-medium"}>{task.nome}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {project ? (
                          <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: project.cor }} />
                            <span className="text-sm">{project.nome}</span>
                          </div>
                        ) : <span className="text-xs text-destructive">—</span>}
                      </TableCell>
                      <TableCell>
                        {type ? <Badge style={{ backgroundColor: type.cor }} className="text-white">{type.nome}</Badge> : <span className="text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={STATE_VARIANT[task.estado]?.className}>
                          {STATE_VARIANT[task.estado]?.label ?? task.estado}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {schedule ? (
                          <div className="flex flex-col leading-tight">
                            <span>{format(new Date(`${schedule.data}T00:00:00`), "dd/MM/yyyy")}</span>
                            <span className="text-muted-foreground">{schedule.hora_inicio} – {schedule.hora_fim}</span>
                          </div>
                        ) : "—"}
                      </TableCell>

                      <TableCell className="font-mono text-xs">
                        {task.tempo_gasto ? formatHoursMinutes(task.tempo_gasto) : "—"}
                        {task.historico_replanejamentos > 0 && (
                          <span className="ml-2 text-amber-600">↻{task.historico_replanejamentos}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button size="icon" variant="ghost" title="Anotações" onClick={() => setNotesTarget(task)}>
                            <StickyNote className={cn("h-4 w-4", task.anotacoes ? "text-primary" : "text-muted-foreground")} />
                          </Button>
                          {isActive && (
                            <>
                              <Button size="icon" variant="ghost" title="Editar" onClick={() => { setEditTarget(task); setEditProjectId(task.projeto_id || "none"); setEditTypeId(task.task_type_id || "none"); }}>
                                <Pencil className="h-4 w-4 text-blue-600" />
                              </Button>
                              <Button size="icon" variant="ghost" title="Concluir" onClick={() => { setCompleteTarget(task); setTempoH(""); setTempoM(""); }}>
                                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                              </Button>
                              <Button size="icon" variant="ghost" title="Cancelar" onClick={() => {
                                if (window.confirm(`Cancelar "${task.nome}"?`)) { cancelTask(task.id); toast.success("Cancelada"); }
                              }}>
                                <XCircle className="h-4 w-4 text-amber-600" />
                              </Button>
                            </>
                          )}
                          {!isActive && (
                            <Button size="icon" variant="ghost" title="Reabrir" onClick={() => {
                              reopenTask(task.id); toast.success("Tarefa reaberta");
                            }}>
                              <RotateCcw className="h-4 w-4 text-blue-600" />
                            </Button>
                          )}
                          <Button size="icon" variant="ghost" title="Deletar" onClick={() => {
                            if (window.confirm(`Deletar "${task.nome}"?`)) { deleteTask(task.id); toast.success("Removida"); }
                          }}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!completeTarget} onOpenChange={(o) => !o && setCompleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Concluir tarefa</DialogTitle>
            <DialogDescription>{completeTarget?.nome}</DialogDescription>
          </DialogHeader>
          <HoursMinutesInput
            hours={tempoH}
            minutes={tempoM}
            onHoursChange={setTempoH}
            onMinutesChange={setTempoM}
            idPrefix="tasks-tempo"
            autoFocus
          />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setCompleteTarget(null)}>Cancelar</Button>
            <Button onClick={handleComplete}>Concluir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editTarget} onOpenChange={(o) => !o && setEditTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar tarefa</DialogTitle>
            <DialogDescription>{editTarget?.nome}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Projeto</Label>
              <Select value={editProjectId} onValueChange={setEditProjectId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sem projeto</SelectItem>
                  {projects.map((p: any) => <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Tipo</Label>
              <Select value={editTypeId} onValueChange={setEditTypeId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sem tipo</SelectItem>
                  {types.map((t: any) => <SelectItem key={t.id} value={t.id}>{t.nome}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditTarget(null)}>Cancelar</Button>
            <Button onClick={() => {
              if (!editTarget) return;
              updateTask(editTarget.id, {
                projeto_id: editProjectId === "none" ? null : editProjectId,
                task_type_id: editTypeId === "none" ? null : editTypeId,
              });
              toast.success("Tarefa atualizada");
              setEditTarget(null);
            }}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!notesTarget} onOpenChange={(o) => { if (!o) { setNotesTarget(null); setNewTodoTitle(""); setNewTodoDate(undefined); } }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Anotações</DialogTitle>
            <DialogDescription>{notesTarget?.nome}</DialogDescription>
          </DialogHeader>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={5}
            maxLength={2000}
            placeholder="Notas, contexto, links…"
            autoFocus
          />

          {notesTarget && (
            <div className="space-y-2 rounded-md border bg-muted/30 p-3">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <ClipboardList className="h-4 w-4" /> TODOs desta tarefa
              </div>

              <div className="space-y-1">
                {getTodosByTask(notesTarget.id).length === 0 && (
                  <p className="text-xs text-muted-foreground">Nenhum TODO ainda.</p>
                )}
                {getTodosByTask(notesTarget.id).map((td: any) => (
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
                  value={newTodoTitle}
                  onChange={(e) => setNewTodoTitle(e.target.value)}
                  placeholder="Novo TODO..."
                  className="h-8 flex-1 min-w-[180px]"
                  maxLength={255}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newTodoTitle.trim()) {
                      e.preventDefault();
                      try {
                        addTodo(notesTarget.id, newTodoTitle.trim(), newTodoDate ? formatDate(newTodoDate) : null);
                        setNewTodoTitle(""); setNewTodoDate(undefined);
                      } catch (err: any) { toast.error(err.message); }
                    }
                  }}
                />
                <Popover>
                  <PopoverTrigger asChild>
                    <Button type="button" variant="outline" size="sm" className="h-8">
                      <CalendarIcon className="mr-1 h-3.5 w-3.5" />
                      {newTodoDate ? format(newTodoDate, "dd/MM") : "Prazo"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <Calendar mode="single" selected={newTodoDate} onSelect={setNewTodoDate} initialFocus className={cn("p-3 pointer-events-auto")} />
                  </PopoverContent>
                </Popover>
                <Button
                  type="button"
                  size="sm"
                  className="h-8"
                  disabled={!newTodoTitle.trim()}
                  onClick={() => {
                    try {
                      addTodo(notesTarget.id, newTodoTitle.trim(), newTodoDate ? formatDate(newTodoDate) : null);
                      setNewTodoTitle(""); setNewTodoDate(undefined);
                      toast.success("TODO criado");
                    } catch (err: any) { toast.error(err.message); }
                  }}
                >
                  <Plus className="mr-1 h-3.5 w-3.5" /> TODO
                </Button>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="ghost" onClick={() => setNotesTarget(null)}>Cancelar</Button>
            <Button onClick={() => {
              if (!notesTarget) return;
              updateTask(notesTarget.id, { anotacoes: notes });
              toast.success("Anotações salvas");
              setNotesTarget(null);
            }}>Salvar anotações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SortableHead({
  label, sortKey, current, dir, onClick, className,
}: {
  label: string;
  sortKey: SortKey;
  current: SortKey;
  dir: SortDir;
  onClick: (k: SortKey) => void;
  className?: string;
}) {
  const active = current === sortKey;
  const Icon = active ? (dir === "asc" ? ArrowUp : ArrowDown) : ArrowUpDown;
  return (
    <TableHead className={className}>
      <button
        type="button"
        onClick={() => onClick(sortKey)}
        className={cn(
          "inline-flex items-center gap-1 text-xs font-medium hover:text-foreground transition-colors",
          active ? "text-foreground" : "text-muted-foreground"
        )}
      >
        {label}
        <Icon className="h-3 w-3" />
      </button>
    </TableHead>
  );
}

