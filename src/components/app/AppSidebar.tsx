import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, CalendarDays, ListTodo, FolderKanban, Tags, BarChart3, Clock, ClipboardList, CalendarCheck } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { useAppContext } from "@/hooks/useAppContext";

const items = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Calendário", url: "/calendar", icon: CalendarDays },
  { title: "Tarefas", url: "/tasks", icon: ListTodo },
  { title: "TODOs", url: "/todos", icon: ClipboardList },
  { title: "Projetos", url: "/projects", icon: FolderKanban },
  { title: "Tipos", url: "/types", icon: Tags },
  { title: "Métricas", url: "/metrics", icon: BarChart3 },
  { title: "Google Calendar", url: "/google-calendar", icon: CalendarCheck },
];

export function AppSidebar() {
  const { pathname } = useLocation();
  const { getOffenderTasks } = useAppContext();
  const offenders = getOffenderTasks().length;

  const isActive = (url: string) =>
    url === "/" ? pathname === "/" : pathname.startsWith(url);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-2 px-2 py-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Clock className="h-4 w-4" />
          </div>
          <div className="flex flex-col leading-tight group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-semibold">Time Blocking</span>
            <span className="text-xs text-muted-foreground">Planejamento local</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegação</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                    <Link to={item.url} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span>{item.title}</span>
                      {item.url === "/tasks" && offenders > 0 && (
                        <Badge variant="destructive" className="ml-auto h-5 px-1.5 text-[10px] group-data-[collapsible=icon]:hidden">
                          {offenders}
                        </Badge>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
