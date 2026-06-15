// Catch-all: SPA entry for ALL /app/* paths (standalone, no Shopify AppBridge)
import { useRouteLoaderData } from "@remix-run/react";

const isDev = process.env.NODE_ENV !== "production";

export default function AppCatchAll() {
  const data = useRouteLoaderData<{ shop: string }>("routes/app");
  return (
    <>
      <div
        id="root"
        style={{ height: "100vh" }}
        data-shop={data?.shop || ""}
        data-api-token={process.env.API_TOKEN || ""}
        data-api-base={process.env.VELA_API_URL || "http://localhost:8000"}
      />
      {isDev ? (
        <script type="module" src="/spa/src/main.tsx" />
      ) : (
        <script type="module" src="/spa-dist/main.js" />
      )}
    </>
  );
}
