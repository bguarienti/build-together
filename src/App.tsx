import { Routes, Route, Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { AppContextProvider } from "./context/AppContext.jsx";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app/AppSidebar";
import { Toaster } from "@/components/ui/sonner";
import { Dashboard } from "@/pages/Dashboard";
import { TasksPage } from "@/pages/TasksPage";
import { CalendarPage } from "@/pages/CalendarPage";
import { ProjectsPage } from "@/pages/ProjectsPage";
import { TypesPage } from "@/pages/TypesPage";
import { MetricsPage } from "@/pages/MetricsPage";
import { TodosPage } from "@/pages/TodosPage";
import { GoogleCalendarPage } from "@/pages/GoogleCalendarPage";

const titles: Record<string, string> = {
  "/": "Dashboard — Time Blocking",
  "/tasks": "Tarefas — Time Blocking",
  "/calendar": "Calendário — Time Blocking",
  "/projects": "Projetos — Time Blocking",
  "/types": "Tipos — Time Blocking",
  "/metrics": "Métricas — Time Blocking",
  "/todos": "TODOs — Time Blocking",
  "/google-calendar": "Google Calendar — Time Blocking",
};

function TitleSync() {
  const { pathname } = useLocation();
  useEffect(() => {
    document.title = titles[pathname] ?? "Time Blocking";
  }, [pathname]);
  return null;
}

function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Página não encontrada</h2>
        <p className="mt-2 text-sm text-muted-foreground">A página que você procura não existe.</p>
        <div className="mt-6">
          <Link to="/" className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppContextProvider>
      <TitleSync />
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/types" element={<TypesPage />} />
            <Route path="/metrics" element={<MetricsPage />} />
            <Route path="/todos" element={<TodosPage />} />
            <Route path="/google-calendar" element={<GoogleCalendarPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </SidebarInset>
        <Toaster richColors position="top-right" />
      </SidebarProvider>
    </AppContextProvider>
  );
}
