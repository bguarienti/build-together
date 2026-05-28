import { Download, Moon, Sun } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useAppContext } from "@/hooks/useAppContext";
import { exportToJSON } from "@/utils/export";
import { toast } from "sonner";
import { useTheme } from "@/hooks/useTheme";

interface TopbarProps {
  title: string;
  description?: string;
}

export function Topbar({ title, description }: TopbarProps) {
  const { state } = useAppContext();
  const { theme, toggle } = useTheme();

  const handleExport = () => {
    try {
      exportToJSON(state);
      toast.success("Backup exportado com sucesso");
    } catch (err) {
      toast.error("Erro ao exportar dados");
    }
  };

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur">
      <SidebarTrigger />
      <Separator orientation="vertical" className="h-6" />
      <div className="flex flex-col leading-tight">
        <h1 className="text-sm font-semibold text-foreground">{title}</h1>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
      <div className="ml-auto flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={toggle} aria-label="Alternar tema">
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" />
          Exportar JSON
        </Button>
      </div>
    </header>
  );
}

