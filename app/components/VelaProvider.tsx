// ============================================================================
// Vela Storefront — VelaProvider
// ============================================================================
// Provides API token, shop context, and API base URL to the SPA.
// Replaces Shopify AppBridge with direct API token auth (X-API-Key header).
// ============================================================================
import { createContext, useContext, type ReactNode } from "react";

export interface VelaContextValue {
  apiToken: string;
  apiBase: string;
  shop: string;
}

const VelaCtx = createContext<VelaContextValue>({
  apiToken: "",
  apiBase: "",
  shop: "",
});

export function useVela() {
  return useContext(VelaCtx);
}

export function VelaProvider({
  children,
  apiToken,
  apiBase,
  shop,
}: {
  children: ReactNode;
  apiToken: string;
  apiBase: string;
  shop: string;
}) {
  return (
    <VelaCtx.Provider value={{ apiToken, apiBase, shop }}>
      {children}
    </VelaCtx.Provider>
  );
}
