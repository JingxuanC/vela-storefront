// ============================================================================
// Vela Storefront — Root Layout (standalone, no Shopify/Polaris)
// ============================================================================
import {
  Links, Meta, Outlet, Scripts, ScrollRestoration,
  useRouteError,
} from "@remix-run/react";
import type { LinksFunction } from "@remix-run/node";

// ── Vela Design System ──
import designTokensStyles from "~/styles/design-tokens.css?url";
import globalsStyles from "~/styles/globals.css?url";
import responsiveStyles from "~/styles/responsive.css?url";

export const links: LinksFunction = () => [
  { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap",
  },
  { rel: "stylesheet", href: designTokensStyles },
  { rel: "stylesheet", href: globalsStyles },
  { rel: "stylesheet", href: responsiveStyles },
];

export default function Root() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <div style={{ padding: "2rem", fontFamily: "system-ui, sans-serif" }}>
          <h1>Something went wrong</h1>
          <p>Please try refreshing the page.</p>
          {error instanceof Error && (
            <pre style={{ color: "red", fontSize: "0.875rem" }}>{error.message}</pre>
          )}
        </div>
        <Scripts />
      </body>
    </html>
  );
}
