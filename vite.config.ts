import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ command }) => {
  // GitHub Pages serves this repo under /build-together/. Keep dev at root.
  const base =
    process.env.VITE_BASE ?? (command === "build" ? "/build-together/" : "/");

  return {
    base,
    plugins: [react(), tsconfigPaths(), tailwindcss()],
    server: { host: "::", port: 8080 },
    preview: { host: "::", port: 8080 },
  };
});
