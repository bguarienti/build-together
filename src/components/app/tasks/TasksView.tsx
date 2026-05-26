import { useMemo, useState } from "react";
import { Plus, Trash2, CheckCircle2, XCircle, AlertTriangle, X, CalendarIcon, RotateCcw } from "lucide-react";
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

type StateFilter = "all" | "aberta" | "agendada" | "concluída" | "cancelada";

const STATE_VARIANT: Record<string, { label: string; className: string }> = {
  aberta: { label: "Aberta", className: "bg-slate-100 text-slate-700" },
  agendada: { label: "Agendada", className: "bg-blue-100 text-blue-700" },
  "concluída": { label: "Concluída", className: "bg-emerald-100 text-emerald-700" },
  cancelada: { label: "Cancelada", className: "bg-zinc-100 text-zinc-500 line-through" },
};

export function TasksView() {
  const { getTasks, getProjects, getTaskTypes, addTask, addSchedule, deleteTask, completeTask, cancelTask, reopenTask } = useAppContext();
  const tasks = getTasks();
  const projects = getProjects();
  const types = getTaskTypes();

  const [filter, setFilter] = useState<StateFilter>("all");
  const [projFilter, setProjFilter] = useState<string>("all");
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [projectId, setProjectId] = useState<string>("none");
  const [typeId, setTypeId] = useState<string>("none");
  const [schedule, setSchedule] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [startTime, setStartTime] = useState<string>("09:00");
  const [durationMin, setDurationMin] = useState<number>(60);
  const [completeTarget, setCompleteTarget] = useState<any | null>(null);
  const [tempoGasto, setTempoGasto] = useState("");

  const timeOptions = useMemo(() => {
    const out: string[] = [];
    for (let h = 6; h <= 22; h++) {
      for (let m = 0; m < 60; m += SLOT_MINUTES) {
        out.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
      }
    }
    return out;
  }, []);

  const filtered = useMemo(() => {
    return tasks.filter((t: any) => {
      if (filter !== "all" && t.estado !== filter) return false;
      if (projFilter === "offenders") return !t.projeto_id;
      if (projFilter !== "all" && t.projeto_id !== projFilter) return false;
      return true;
    });
  }, [tasks, filter, projFilter]);

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
      const t = parseFloat(tempoGasto);
      if (!t || t <= 0) throw new Error("Tempo gasto deve ser positivo");
      completeTask(completeTarget.id, t);
      toast.success("Tarefa concluída");
      setCompleteTarget(null);
      setTempoGasto("");
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
                <TableHead className="w-[40%]">Tarefa</TableHead>
                <TableHead>Projeto</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Tempo</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="py-12 text-center text-sm text-muted-foreground">Nenhuma tarefa</TableCell></TableRow>
              ) : (
                filtered.map((task: any) => {
                  const project = projects.find((p: any) => p.id === task.projeto_id);
                  const type = task.task_type_id ? types.find((t: any) => t.id === task.task_type_id) : null;
                  const isOffender = !task.projeto_id;
                  const isActive = task.estado === "aberta" || task.estado === "agendada";
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
                        {task.tempo_gasto ? `${task.tempo_gasto}h` : "—"}
                        {task.historico_replanejamentos > 0 && (
                          <span className="ml-2 text-amber-600">↻{task.historico_replanejamentos}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          {isActive && (
                            <>
                              <Button size="icon" variant="ghost" title="Concluir" onClick={() => setCompleteTarget(task)}>
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
          <div className="space-y-2">
            <Label htmlFor="tempo">Tempo gasto (horas)</Label>
            <Input
              id="tempo"
              type="number"
              step="0.25"
              min="0.25"
              placeholder="Ex: 2.5"
              value={tempoGasto}
              onChange={(e) => setTempoGasto(e.target.value)}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setCompleteTarget(null)}>Cancelar</Button>
            <Button onClick={handleComplete}>Concluir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
