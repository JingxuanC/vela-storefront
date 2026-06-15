import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  plugins: [
    remix({
      ignoredRouteFiles: ["**/*.css"],
    }),
  ],
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "app"),
    },
  },
  server: {
    allowedHosts: [".trycloudflare.com", ".velagrow.com", "velagrow.com"],
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
        headers: { "X-Internal-Secret": process.env.INTERNAL_SECRET || "vela-dev-secret" },
      },
    },
  },
});
