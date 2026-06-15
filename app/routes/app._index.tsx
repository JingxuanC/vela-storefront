// ============================================================================
// Vela Storefront — Admin SPA entry point
// ============================================================================
import { useRouteLoaderData } from "@remix-run/react";
import { VelaProvider } from "~/components/VelaProvider";

const isDev = process.env.NODE_ENV !== "production";

export default function AppIndex() {
  const data = useRouteLoaderData<{ shop: string }>("routes/app");
  const shop = data?.shop || "";

  return (
    <VelaProvider
      apiToken={process.env.API_TOKEN || ""}
      apiBase={process.env.VELA_API_URL || "http://localhost:8000"}
      shop={shop}
    >
      <div id="root" style={{ height: "100vh" }} />
      {isDev ? (
        <script type="module" src="/spa/src/main.tsx" />
      ) : (
        <script type="module" src="/spa-dist/main.js" />
      )}
    </VelaProvider>
  );
}
