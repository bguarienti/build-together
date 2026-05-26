import { useMemo, useState } from "react";
import { format } from "date-fns";
import { Plus, X, CheckCircle2, XCircle, RotateCcw, Trash2, CalendarIcon, ClipboardList } from "lucide-react";
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
import { formatDate } from "@/utils/date";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type StateFilter = "all" | "aberta" | "concluída" | "cancelada";

const STATE_VARIANT: Record<string, { label: string; className: string }> = {
  aberta: { label: "Aberto", className: "bg-slate-100 text-slate-700" },
  "concluída": { label: "Concluído", className: "bg-emerald-100 text-emerald-700" },
  cancelada: { label: "Cancelado", className: "bg-zinc-100 text-zinc-500 line-through" },
};

export function TodosView() {
  const { getTodos, getTasks, addTodo, deleteTodo, completeTodo, cancelTodo, reopenTodo, updateTodo } = useAppContext();
  const todos = getTodos();
  const tasks = getTasks();

  const [filter, setFilter] = useState<StateFilter>("all");
  const [taskFilter, setTaskFilter] = useState<string>("all");
  const [showForm, setShowForm] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [tarefaId, setTarefaId] = useState<string>("none");
  const [prazo, setPrazo] = useState<Date | undefined>(undefined);

  const today = formatDate(new Date());

  const filtered = useMemo(() => {
    return todos
      .filter((td: any) => {
        if (filter !== "all" && td.estado !== filter) return false;
        if (taskFilter === "none") return !td.tarefa_id;
        if (taskFilter !== "all" && td.tarefa_id !== taskFilter) return false;
        return true;
      })
      .sort((a: any, b: any) => {
        // Open first, then by prazo asc (null last), then created desc
        if ((a.estado === "aberta") !== (b.estado === "aberta")) return a.estado === "aberta" ? -1 : 1;
        if (a.prazo && b.prazo) return a.prazo.localeCompare(b.prazo);
        if (a.prazo) return -1;
        if (b.prazo) return 1;
        return b.data_criacao - a.data_criacao;
      });
  }, [todos, filter, taskFilter]);

  const reset = () => {
    setTitulo(""); setTarefaId("none"); setPrazo(undefined); setShowForm(false);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      addTodo(tarefaId === "none" ? null : tarefaId, titulo.trim(), prazo ? formatDate(prazo) : null);
      toast.success("TODO criado");
      reset();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as StateFilter)}>
          <TabsList>
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="aberta">Abertos</TabsTrigger>
            <TabsTrigger value="concluída">Concluídos</TabsTrigger>
            <TabsTrigger value="cancelada">Cancelados</TabsTrigger>
          </TabsList>
        </Tabs>
        <Select value={taskFilter} onValueChange={setTaskFilter}>
          <SelectTrigger className="w-[240px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as tarefas</SelectItem>
            <SelectItem value="none">Sem tarefa vinculada</SelectItem>
            {tasks.map((t: any) => (
              <SelectItem key={t.id} value={t.id}>{t.nome}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button size="sm" className="ml-auto" onClick={() => setShowForm((v) => !v)}>
          {showForm ? <X className="mr-1 h-4 w-4" /> : <Plus className="mr-1 h-4 w-4" />}
          {showForm ? "Cancelar" : "Novo TODO"}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="space-y-4 p-4">
            <form onSubmit={submit} className="space-y-4">
              <div className="grid gap-3 md:grid-cols-[2fr_1fr_1fr]">
                <div className="space-y-1.5">
                  <Label htmlFor="td-title">Título</Label>
                  <Input id="td-title" value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="O que precisa ser feito?" autoFocus maxLength={255} />
                </div>
                <div className="space-y-1.5">
                  <Label>Tarefa vinculada</Label>
                  <Select value={tarefaId} onValueChange={setTarefaId}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sem tarefa</SelectItem>
                      {tasks.map((t: any) => <SelectItem key={t.id} value={t.id}>{t.nome}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Prazo (opcional)</Label>
                  <div className="flex gap-1">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button type="button" variant="outline" className={cn("flex-1 justify-start text-left font-normal", !prazo && "text-muted-foreground")}>
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {prazo ? format(prazo, "dd/MM/yyyy") : "Sem prazo"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={prazo} onSelect={setPrazo} initialFocus className={cn("p-3 pointer-events-auto")} />
                      </PopoverContent>
                    </Popover>
                    {prazo && (
                      <Button type="button" variant="ghost" size="icon" onClick={() => setPrazo(undefined)}>
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <Button type="submit">Criar TODO</Button>
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
                <TableHead className="w-[45%]">Título</TableHead>
                <TableHead>Tarefa</TableHead>
                <TableHead>Prazo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-12 text-center text-sm text-muted-foreground">
                    <ClipboardList className="mx-auto mb-2 h-6 w-6 opacity-40" />
                    Nenhum TODO
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((td: any) => {
                  const task = td.tarefa_id ? tasks.find((t: any) => t.id === td.tarefa_id) : null;
                  const isActive = td.estado === "aberta";
                  const isOverdue = isActive && td.prazo && td.prazo < today;
                  const isDueToday = isActive && td.prazo === today;
                  return (
                    <TableRow key={td.id}>
                      <TableCell>
                        <span className={td.estado === "cancelada" ? "text-muted-foreground line-through" : "font-medium"}>
                          {td.titulo}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm">
                        {task ? task.nome : <span className="text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell className="text-sm">
                        {td.prazo ? (
                          <span className={cn(
                            "font-mono text-xs",
                            isOverdue && "text-destructive font-semibold",
                            isDueToday && "text-amber-600 font-semibold"
                          )}>
                            {format(new Date(td.prazo + "T00:00:00"), "dd/MM/yyyy")}
                            {isOverdue && " (atrasado)"}
                            {isDueToday && " (hoje)"}
                          </span>
                        ) : <span className="text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={STATE_VARIANT[td.estado]?.className}>
                          {STATE_VARIANT[td.estado]?.label ?? td.estado}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          {isActive && (
                            <>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button size="icon" variant="ghost" title="Editar prazo">
                                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="end">
                                  <Calendar
                                    mode="single"
                                    selected={td.prazo ? new Date(td.prazo + "T00:00:00") : undefined}
                                    onSelect={(d) => updateTodo(td.id, { prazo: d ? formatDate(d) : null })}
                                    initialFocus
                                    className={cn("p-3 pointer-events-auto")}
                                  />
                                  {td.prazo && (
                                    <div className="border-t p-2">
                                      <Button size="sm" variant="ghost" className="w-full" onClick={() => updateTodo(td.id, { prazo: null })}>
                                        Remover prazo
                                      </Button>
                                    </div>
                                  )}
                                </PopoverContent>
                              </Popover>
                              <Button size="icon" variant="ghost" title="Concluir" onClick={() => { completeTodo(td.id); toast.success("Concluído"); }}>
                                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                              </Button>
                              <Button size="icon" variant="ghost" title="Cancelar" onClick={() => { cancelTodo(td.id); toast.success("Cancelado"); }}>
                                <XCircle className="h-4 w-4 text-amber-600" />
                              </Button>
                            </>
                          )}
                          {!isActive && (
                            <Button size="icon" variant="ghost" title="Reabrir" onClick={() => { reopenTodo(td.id); toast.success("Reaberto"); }}>
                              <RotateCcw className="h-4 w-4 text-blue-600" />
                            </Button>
                          )}
                          <Button size="icon" variant="ghost" title="Deletar" onClick={() => {
                            if (window.confirm(`Deletar TODO "${td.titulo}"?`)) { deleteTodo(td.id); toast.success("Removido"); }
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
    </div>
  );
}
