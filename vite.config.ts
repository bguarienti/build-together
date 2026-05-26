import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";

// Base path para GitHub Pages. Para deploy custom domain ou outro host, deixe "/".
const base = process.env.VITE_BASE ?? "/local-time-blocking/";

export default defineConfig({
  base,
  plugins: [react(), tsconfigPaths(), tailwindcss()],
  server: { host: "::", port: 8080 },
  preview: { host: "::", port: 8080 },
});
