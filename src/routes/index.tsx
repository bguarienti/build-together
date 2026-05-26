import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-8">
      <div className="max-w-xl text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          Projeto pronto
        </h1>
        <p className="mt-3 text-muted-foreground">
          Cole seu código aqui ou me diga o que construir em seguida.
        </p>
      </div>
    </main>
  );
}
