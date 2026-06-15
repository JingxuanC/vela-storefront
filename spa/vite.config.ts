import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ command }) => ({
  base: command === "serve" ? "/spa/" : "/spa-dist/",
  plugins: [react()],
  resolve: { alias: { "~": path.resolve(__dirname, "src") } },
  server: {
    port: 5174,
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
        headers: { "X-Internal-Secret": process.env.INTERNAL_SECRET || "vela-dev-secret" },
        rewrite: (path: string) => path.replace(/^\/api\/aitools/, "/api"),
      },
    },
  },
  build: { outDir: "../public/spa-dist", assetsDir: "assets", manifest: true, rollupOptions: { output: { entryFileNames: "main.js" } } },
}));
