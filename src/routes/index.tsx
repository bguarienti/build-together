import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
// @ts-expect-error - legacy JSX module
import App from "../App.jsx";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Time Blocking — Planejamento Local" },
      { name: "description", content: "Sistema local de time blocking com projetos, tarefas e agenda semanal." },
    ],
  }),
  component: Index,
});

function Index() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background p-8">
        <p className="text-muted-foreground">Carregando…</p>
      </main>
    );
  }

  return <App />;
}
