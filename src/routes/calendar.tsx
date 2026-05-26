import { createFileRoute } from "@tanstack/react-router";
import { Topbar } from "@/components/app/Topbar";
import { CalendarView } from "@/components/app/calendar/CalendarView";

export const Route = createFileRoute("/calendar")({
  head: () => ({ meta: [{ title: "Calendário — Time Blocking" }] }),
  component: CalendarPage,
});

function CalendarPage() {
  return (
    <>
      <Topbar title="Calendário semanal" description="Arraste tarefas para os horários" />
      <div className="flex-1 p-4">
        <CalendarView />
      </div>
    </>
  );
}
