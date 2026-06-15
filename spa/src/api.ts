// ============================================================================
// Vela Storefront — SPA API Client (standalone, no Shopify AppBridge)
// ============================================================================

function getShop(): string {
  const fromUrl = new URLSearchParams(window.location.search).get("shop");
  if (fromUrl) return fromUrl;
  const fromHash = new URLSearchParams(window.location.hash.replace("#", "?")).get("shop");
  if (fromHash) return fromHash;
  const root = document.getElementById("root");
  if (root?.dataset.shop) return root.dataset.shop;
  return "";
}

export function shopId(): string { return getShop(); }

function getApiToken(): string {
  const root = document.getElementById("root");
  return root?.dataset.apiToken || "";
}

function getApiBase(): string {
  const root = document.getElementById("root");
  return root?.dataset.apiBase || "";
}

function getAuthHeaders(): Record<string, string> {
  const token = getApiToken();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) {
    headers["X-API-Key"] = token;
  }
  return headers;
}

export async function api<T>(path: string, opts?: RequestInit): Promise<T | null> {
  const headers = getAuthHeaders();

  let url = path;
  if (!url.startsWith("http")) {
    url = `${getApiBase()}${path}`;
  }

  try {
    const res = await fetch(url, {
      ...opts,
      headers: { ...headers, ...(opts?.headers as Record<string, string> || {}) },
    });
    if (!res.ok) { console.error(`API ${path}: ${res.status}`); return null; }
    return res.json() as Promise<T>;
  } catch (err) { console.error(`API ${path}:`, err); return null; }
}
