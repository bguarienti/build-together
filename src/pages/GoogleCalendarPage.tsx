import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Calendar as CalendarIcon, Link2, LogOut, Plus, RefreshCw, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAppContext } from "@/hooks/useAppContext";
import {
  clearToken,
  getClientId,
  isConnected as gcalIsConnected,
  listCalendars,
  listEventsForDay,
  requestAccessToken,
  setClientId as saveClientId,
  type GCalCalendar,
  type GCalEvent,
} from "@/lib/googleCalendar";

function todayISO() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

function fmtTime(e: GCalEvent) {
  if (e.start.date) return "Dia inteiro";
  const s = new Date(e.start.dateTime!);
  const f = new Date(e.end.dateTime!);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(s.getHours())}:${p(s.getMinutes())} – ${p(f.getHours())}:${p(f.getMinutes())}`;
}

export function GoogleCalendarPage() {
  const { addTask, getProjects } = useAppContext();
  const projects = getProjects();

  const [clientId, setClientIdState] = useState(getClientId());
  const [editingClient, setEditingClient] = useState(!getClientId());
  const [connected, setConnected] = useState(gcalIsConnected());

  const [calendars, setCalendars] = useState<GCalCalendar[]>([]);
  const [calendarId, setCalendarId] = useState<string>(
    localStorage.getItem("gcal.lastCalendarId") || "primary"
  );
  const [date, setDate] = useState<string>(todayISO());
  const [events, setEvents] = useState<GCalEvent[]>([]);
  const [loading, setLoading] = useState(false);

  const [importing, setImporting] = useState<GCalEvent | null>(null);
  const [taskName, setTaskName] = useState("");
  const [taskProject, setTaskProject] = useState<string>("none");

  const canQuery = connected && !!calendarId;

  useEffect(() => {
    if (!connected) return;
    listCalendars()
      .then(setCalendars)
      .catch((e) => toast.error(e.message));
  }, [connected]);

  const loadEvents = useMemo(
    () => async () => {
      if (!canQuery) return;
      setLoading(true);
      try {
        const day = new Date(date + "T00:00:00");
        const items = await listEventsForDay(calendarId, day);
        setEvents(items);
      } catch (e: any) {
        toast.error(e.message);
        if (/expirada/i.test(e.message)) setConnected(false);
      } finally {
        setLoading(false);
      }
    },
    [canQuery, calendarId, date]
  );

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  useEffect(() => {
    localStorage.setItem("gcal.lastCalendarId", calendarId);
  }, [calendarId]);

  const handleSaveClientId = () => {
    if (!clientId.trim()) {
      toast.error("Informe o Client ID.");
      return;
    }
    saveClientId(clientId);
    setEditingClient(false);
    toast.success("Client ID salvo.");
  };

  const handleConnect = async () => {
    try {
      await requestAccessToken("consent");
      setConnected(true);
      toast.success("Conectado ao Google Calendar.");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleDisconnect = () => {
    clearToken();
    setConnected(false);
    setEvents([]);
    setCalendars([]);
    toast.success("Desconectado.");
  };

  const openImport = (ev: GCalEvent) => {
    setImporting(ev);
    setTaskName(ev.summary || "(sem título)");
    setTaskProject("none");
  };

  const confirmImport = () => {
    if (!importing) return;
    try {
      addTask(
        taskName,
        taskProject === "none" ? null : taskProject,
        null
      );
      toast.success("Tarefa criada.");
      setImporting(null);
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background/95 px-6 py-4 backdrop-blur">
        <div className="flex items-center gap-3">
          <CalendarIcon className="h-5 w-5 text-primary" />
          <div className="flex-1">
            <h1 className="text-lg font-semibold">Google Calendar</h1>
            <p className="text-xs text-muted-foreground">
              Importe eventos do dia como tarefas. Conexão 100% local no navegador.
            </p>
          </div>
          {connected && (
            <Button variant="outline" size="sm" onClick={handleDisconnect}>
              <LogOut className="mr-2 h-4 w-4" /> Desconectar
            </Button>
          )}
        </div>
      </header>

      <main className="flex-1 space-y-6 p-6">
        {/* Setup */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Settings className="h-4 w-4" /> Configuração OAuth
            </CardTitle>
            <CardDescription>
              Crie uma OAuth 2.0 Client ID (tipo "Web application") no Google Cloud
              Console, habilite a Google Calendar API, e adicione a origem deste
              site em "Authorized JavaScript origins".
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {editingClient ? (
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  placeholder="xxxxx.apps.googleusercontent.com"
                  value={clientId}
                  onChange={(e) => setClientIdState(e.target.value)}
                  className="font-mono text-xs"
                />
                <Button onClick={handleSaveClientId}>Salvar</Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <code className="flex-1 truncate rounded bg-muted px-3 py-2 text-xs">
                  {clientId}
                </code>
                <Button variant="outline" size="sm" onClick={() => setEditingClient(true)}>
                  Alterar
                </Button>
              </div>
            )}
            <div className="space-y-2 text-xs text-muted-foreground">
              <div>
                Origem para colar em "Authorized JavaScript origins":{" "}
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.origin);
                    toast.success("Origem copiada.");
                  }}
                  className="font-mono text-foreground underline"
                  title="Copiar"
                >
                  {window.location.origin}
                </button>
              </div>
              {window.self !== window.top && (
                <div className="rounded border border-amber-500/40 bg-amber-500/10 p-2 text-amber-700 dark:text-amber-300">
                  Você está vendo o app dentro do iframe do preview do Lovable.
                  O popup do Google costuma ser bloqueado aqui — abra em uma
                  nova aba antes de conectar.
                  <div className="mt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(window.location.href, "_blank")}
                    >
                      Abrir em nova aba
                    </Button>
                  </div>
                </div>
              )}
            </div>
            {!connected && !editingClient && (
              <Button onClick={handleConnect} className="w-full sm:w-auto">
                <Link2 className="mr-2 h-4 w-4" /> Conectar Google
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Filters */}
        {connected && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Eventos do dia</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="flex-1">
                  <Label className="text-xs">Agenda</Label>
                  <Select value={calendarId} onValueChange={setCalendarId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {calendars.length === 0 && (
                        <SelectItem value="primary">primary</SelectItem>
                      )}
                      {calendars.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.summary} {c.primary ? "(principal)" : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Data</Label>
                  <Input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
                <Button variant="outline" onClick={loadEvents} disabled={loading}>
                  <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                  Atualizar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Events list */}
        {connected && (
          <div className="space-y-2">
            {loading && (
              <p className="text-sm text-muted-foreground">Carregando eventos...</p>
            )}
            {!loading && events.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Nenhum evento encontrado para essa data.
              </p>
            )}
            {events.map((ev) => (
              <Card key={ev.id}>
                <CardContent className="flex items-center gap-4 py-4">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">
                      {ev.summary || "(sem título)"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {fmtTime(ev)}
                      {ev.location ? ` · ${ev.location}` : ""}
                    </div>
                  </div>
                  <Button size="sm" onClick={() => openImport(ev)}>
                    <Plus className="mr-2 h-4 w-4" /> Criar task
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Dialog open={!!importing} onOpenChange={(o) => !o && setImporting(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar tarefa</DialogTitle>
            <DialogDescription>
              A tarefa será criada como "aberta". Você pode agendá-la depois no calendário.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Nome</Label>
              <Input value={taskName} onChange={(e) => setTaskName(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Projeto (opcional)</Label>
              <Select value={taskProject} onValueChange={setTaskProject}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sem projeto</SelectItem>
                  {projects.map((p: any) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setImporting(null)}>
              Cancelar
            </Button>
            <Button onClick={confirmImport}>Criar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
