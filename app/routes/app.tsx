// ============================================================================
// Vela Storefront — App Layout (standalone, no Shopify OAuth)
// ============================================================================
import { Outlet } from "@remix-run/react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { ToastProvider } from "~/components/ui";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const shopId = url.searchParams.get("shop_id") || "";
  return { shop: shopId };
}

export default function AppLayout() {
  return (
    <ToastProvider>
      <Outlet />
    </ToastProvider>
  );
}
