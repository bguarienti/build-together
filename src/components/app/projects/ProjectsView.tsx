import { useState } from "react";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { useAppContext } from "@/hooks/useAppContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface FormState { id?: string; nome: string; cor: string }

export function ProjectsView() {
  const { getProjects, addProject, updateProject, deleteProject, getTasksByProjectId } = useAppContext();
  const projects = getProjects();
  const [form, setForm] = useState<FormState | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    try {
      if (form.id) {
        updateProject(form.id, { nome: form.nome.trim(), cor: form.cor });
        toast.success("Projeto atualizado");
      } else {
        addProject(form.nome.trim(), form.cor);
        toast.success("Projeto criado");
      }
      setForm(null);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const remove = (p: any) => {
    if (window.confirm(`Deletar projeto "${p.nome}"?`)) {
      deleteProject(p.id);
      toast.success("Projeto removido");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{projects.length} projeto(s) ativo(s)</p>
        <Button size="sm" onClick={() => setForm({ nome: "", cor: "#3b82f6" })}>
          <Plus className="mr-1 h-4 w-4" /> Novo projeto
        </Button>
      </div>

      {form && (
        <Card>
          <CardContent className="p-4">
            <form onSubmit={submit} className="grid gap-3 sm:grid-cols-[1fr_auto_auto_auto] sm:items-end">
              <div className="space-y-1.5">
                <Label htmlFor="p-name">Nome</Label>
                <Input
                  id="p-name"
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  placeholder="Ex: Marketing"
                  maxLength={100}
                  autoFocus
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="p-color">Cor</Label>
                <input
                  id="p-color"
                  type="color"
                  value={form.cor}
                  onChange={(e) => setForm({ ...form, cor: e.target.value })}
                  className="h-9 w-14 cursor-pointer rounded border"
                />
              </div>
              <Button type="submit">{form.id ? "Atualizar" : "Criar"}</Button>
              <Button type="button" variant="ghost" onClick={() => setForm(null)}>
                <X className="h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {projects.length === 0 ? (
        <p className="rounded-md border border-dashed py-12 text-center text-sm text-muted-foreground">
          Nenhum projeto ainda. Crie o primeiro acima.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p: any) => {
            const tasks = getTasksByProjectId(p.id);
            const open = tasks.filter((t: any) => t.estado === "aberta").length;
            const done = tasks.filter((t: any) => t.estado === "concluída").length;
            return (
              <Card key={p.id}>
                <CardContent className="flex items-start gap-3 p-4">
                  <div className="h-10 w-10 shrink-0 rounded-md" style={{ backgroundColor: p.cor }} />
                  <div className="flex-1 space-y-1">
                    <p className="font-medium">{p.nome}</p>
                    <p className="text-xs text-muted-foreground">
                      {tasks.length} tarefa(s) · {open} abertas · {done} concluídas
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => setForm({ id: p.id, nome: p.nome, cor: p.cor || "#3b82f6" })}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => remove(p)}>
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
