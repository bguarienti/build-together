import { useState } from "react";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { useAppContext } from "@/hooks/useAppContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface FormState { id?: string; nome: string; cor: string }

export function TypesView() {
  const { getTaskTypes, addTaskType, updateTaskType, deleteTaskType } = useAppContext();
  const types = getTaskTypes();
  const [form, setForm] = useState<FormState | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    try {
      if (form.id) {
        updateTaskType(form.id, { nome: form.nome.trim(), cor: form.cor });
        toast.success("Tipo atualizado");
      } else {
        addTaskType(form.nome.trim(), form.cor);
        toast.success("Tipo criado");
      }
      setForm(null);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const remove = (t: any) => {
    if (window.confirm(`Deletar tipo "${t.nome}"?`)) {
      deleteTaskType(t.id);
      toast.success("Tipo removido");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{types.length} tipo(s)</p>
        <Button size="sm" onClick={() => setForm({ nome: "", cor: "#3498db" })}>
          <Plus className="mr-1 h-4 w-4" /> Novo tipo
        </Button>
      </div>

      {form && (
        <Card>
          <CardContent className="p-4">
            <form onSubmit={submit} className="grid gap-3 sm:grid-cols-[1fr_auto_auto_auto] sm:items-end">
              <div className="space-y-1.5">
                <Label htmlFor="t-name">Nome</Label>
                <Input
                  id="t-name"
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  placeholder="Ex: Bug, Feature, Reunião"
                  maxLength={100}
                  autoFocus
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="t-color">Cor</Label>
                <input
                  id="t-color"
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

      {types.length === 0 ? (
        <p className="rounded-md border border-dashed py-12 text-center text-sm text-muted-foreground">
          Nenhum tipo criado. Sugestões: Bug, Feature, Refactor, Reunião, Admin.
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {types.map((t: any) => (
            <Card key={t.id} className="group">
              <CardContent className="flex items-center gap-2 p-2">
                <Badge style={{ backgroundColor: t.cor }} className="text-white">{t.nome}</Badge>
                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setForm({ id: t.id, nome: t.nome, cor: t.cor || "#3498db" })}>
                  <Pencil className="h-3 w-3" />
                </Button>
                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => remove(t)}>
                  <Trash2 className="h-3 w-3 text-destructive" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
