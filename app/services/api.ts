// ============================================================================
// VTron API Client
// ============================================================================
// Shared client for calling the Go backend (api-server-go) from Remix loaders
// and actions. Handles auth token injection and error formatting.
// ============================================================================

const isServer = typeof window === "undefined";
const API_BASE = isServer ? (process.env.VTRON_API_URL || "http://localhost:8000") : "";
const API_TOKEN = isServer ? (process.env.API_TOKEN || "") : "";

/**
 * Generic API client for the VTron Go backend.
 * Injects Authorization header from API_TOKEN env var when set.
 * Throws on non-2xx responses with the server's error detail message.
 */
/**
 * Mock data fallback for when the Go backend is offline or rate-limited.
 * Used during E2E tests and local development without the backend running.
 */
function getMockData<T>(path: string): T | null {
  const isE2E = process.env.E2E_MODE === "true";
  if (!isE2E) return null;

  const qs = (key: string) => {
    const m = path.match(new RegExp(`[?&]${key}=([^&]*)`));
    return m ? decodeURIComponent(m[1]) : null;
  };

  if (path.startsWith("/api/shop/usage")) {
    return {
      shop_id: qs("shop_id") || "test-store.myshopify.com",
      plan: "growth",
      monthly_credits_used: 450,
      monthly_credits_total: 1000,
      daily_usage: [12, 15, 8, 22, 18, 14, 20],
      feature_breakdown: [
        { feature_id: "tryon", name: "Virtual Try-On", count: 89 },
        { feature_id: "seo", name: "SEO", count: 34 },
        { feature_id: "desc", name: "Description", count: 45 },
      ],
      total_tryons: 450,
      total_add_to_cart: 120,
      conversion_rate: 26.7,
      total_api_cost: 15.50,
      avg_cost_per_day: 2.21,
    } as T;
  }

  if (path.startsWith("/api/billing/current")) {
    return { plan: "growth", shop_id: qs("shop_id") || "test-store" } as T;
  }

  if (path.startsWith("/api/notifications/preferences") || path.startsWith("/api/notify/preferences")) {
    return {
      shop_id: qs("shop_id") || "test-store.myshopify.com",
      email_return_updates: true,
      email_usage_alerts: false,
      email_marketing: false,
      in_app_notifications: true,
    } as T;
  }

  if (path.startsWith("/api/insights/daily")) {
    return {
      success: true,
      date: qs("date") || "2026-06-08",
      shop_id: qs("shop_id") || "test-store.myshopify.com",
      summary: "Sales increased 12% compared to yesterday. Top category was tops with 34 units sold.",
      highlights: [
        "Revenue up 15% week-over-week",
        "New customer acquisition increased 8%",
        "Return rate dropped to 3.2%",
      ],
      action_items: [
        "Restock best-selling items in tops category",
        "Review return reasons for size issues",
        "Update product descriptions for low-converting items",
      ],
      daily_sales: 128,
      daily_revenue: 4560.50,
    } as T;
  }

  if (path.startsWith("/api/insights/trends")) {
    const category = qs("category") || "all";
    return {
      success: true,
      trends: [
        { category: "tops", direction: "up", percentage: 12.5, description: "Tops trending upward this week", source: "google_trends" },
        { category: "dresses", direction: "up", percentage: 8.3, description: "Summer dress demand increasing", source: "google_trends" },
        { category: "shoes", direction: "down", percentage: -3.1, description: "Footwear interest declining", source: "google_trends" },
        { category: "accessories", direction: "flat", percentage: 0.5, description: "Accessories holding steady", source: "internal" },
      ],
      period: qs("period") || "7d",
    } as T;
  }

  if (path.startsWith("/api/analytics/events/track")) {
    return { success: true, event_id: "mock-event-001" } as T;
  }

  if (path.startsWith("/api/analytics/dashboard")) {
    return {
      success: true,
      return_rate: 3.2,
      return_rate_change: -0.5,
      total_inventory: 4520,
      low_stock_items: 12,
      out_of_stock_items: 3,
      sales_trend: [
        { date: "2026-06-02", sales: 112, revenue: 3890 },
        { date: "2026-06-03", sales: 98, revenue: 3450 },
        { date: "2026-06-04", sales: 134, revenue: 4720 },
        { date: "2026-06-05", sales: 145, revenue: 5100 },
        { date: "2026-06-06", sales: 89, revenue: 3100 },
        { date: "2026-06-07", sales: 156, revenue: 5400 },
        { date: "2026-06-08", sales: 128, revenue: 4560 },
      ],
      top_return_reasons: [
        { reason: "size_too_small", count: 45, ratio: 35 },
        { reason: "size_too_large", count: 30, ratio: 23 },
        { reason: "defect", count: 20, ratio: 15 },
        { reason: "not_as_described", count: 15, ratio: 12 },
        { reason: "changed_mind", count: 18, ratio: 14 },
      ],
      inventory_breakdown: [
        { product_id: "p1", product_name: "Summer Dress", stock_level: 234, reorder_at: 50, status: "healthy" },
        { product_id: "p2", product_name: "Cotton T-Shirt", stock_level: 12, reorder_at: 30, status: "low" },
        { product_id: "p3", product_name: "Running Shoes", stock_level: 0, reorder_at: 20, status: "out_of_stock" },
        { product_id: "p4", product_name: "Denim Jacket", stock_level: 89, reorder_at: 25, status: "healthy" },
      ],
      metrics: [
        { label: "Return Rate", value: 3.2, change: -0.5, trend: "down", unit: "%" },
        { label: "Avg Order Value", value: 45.50, change: 3.2, trend: "up", unit: "$" },
        { label: "Conversion Rate", value: 2.8, change: 0.3, trend: "up", unit: "%" },
        { label: "Total Revenue", value: 29820, change: 12.5, trend: "up", unit: "$" },
      ],
      period: qs("period") || "7d",
    } as T;
  }

  if (path.startsWith("/api/analytics/content-performance")) {
    return {
      success: true,
      total_revenue: 2840.75,
      total_orders: 42,
      by_type: [
        { content_type: "social", revenue: 1520.30 },
        { content_type: "blog", revenue: 890.25 },
        { content_type: "desc", revenue: 430.20 },
      ],
      top_content: [
        { title: "Summer Collection Launch", content_type: "social", platform: "pinterest", revenue: 680.50, orders: 12 },
        { title: "Style Guide: Beach Essentials", content_type: "blog", platform: "-", revenue: 520.00, orders: 8 },
        { title: "Floral Dress - Product Description", content_type: "desc", platform: "-", revenue: 380.20, orders: 7 },
        { title: "Sale Alert: 30 Percent Off", content_type: "social", platform: "instagram", revenue: 450.80, orders: 9 },
        { title: "How to Style Denim", content_type: "blog", platform: "-", revenue: 370.25, orders: 5 },
        { title: "New Arrival Teaser", content_type: "social", platform: "pinterest", revenue: 389.00, orders: 6 },
      ],
    } as T;
  }

  if (path.startsWith("/api/content/pieces")) {
    return {
      pieces: [
        { id: "cp-001", status: "published" },
        { id: "cp-002", status: "published" },
        { id: "cp-003", status: "published" },
        { id: "cp-004", status: "generated" },
        { id: "cp-005", status: "generated" },
      ],
      total: 5,
    } as T;
  }

  if (path.startsWith("/api/style/presets")) {
    return [
      { id: "modern", name: "Modern", prompt: "Modern style" },
      { id: "vintage", name: "Vintage", prompt: "Vintage style" },
    ] as T;
  }

  if (path.startsWith("/api/style/products")) {
    return { styles: [] } as T;
  }

  if (path.startsWith("/api/integrations/judgeme/")) {
    return { connected: false, status: "mock" } as T;
  }

  if (path.startsWith("/api/review/settings")) {
    return { auto_reply_enabled: false, tone: "professional" } as T;
  }

  if (path.startsWith("/api/review/replies")) {
    if (path.includes("/approve") || path.includes("/reject")) {
      return { ok: true } as T;
    }
    return { reviews: [], pending: 0 } as T;
  }

  if (path.startsWith("/api/returns")) {
    return {
      returns: [
        { id: "R001", order: "#1001", product: "Test Dress", status: "pending", customer: "test@example.com", date: "2026-06-01", amount: 29.99 },
        { id: "R002", order: "#1002", product: "Test Shirt", status: "approved", customer: "user@example.com", date: "2026-06-02", amount: 19.99 },
      ],
      total: 2,
      page: 1,
      pageSize: 20,
    } as T;
  }

  if (path.startsWith("/api/exchange")) {
    if (path.includes("/approve") || path.includes("/ship") || path.includes("/complete")) {
      return { ok: true } as T;
    }
    return {
      exchanges: [
        { id: "E001", order: "#2001", product_name: "Test Dress", size_from: "M", size_to: "L", status: "pending", customer: "test@example.com", date: "2026-06-01" },
      ],
      total: 1,
    } as T;
  }

  if (path.startsWith("/api/recommend")) {
    return {
      recommendations: [
        { product: "Product A", score: 0.95 },
        { product: "Product B", score: 0.88 },
      ],
    } as T;
  }

  if (path.startsWith("/api/chat/prompt-optimize")) {
    return { optimized: "Optimized prompt text" } as T;
  }

  // ── Phase 1.6: AI Visibility Suite ──────────────────────────────────────

  if (path.startsWith("/api/visibility/score")) {
    return {
      overall: 72, grade: "good", scanned_at: "2026-06-08T12:00:00Z",
      ucp: { score: 65, weight: 0.40, checks: [
        { name: "标题具象度", weight: 0.20, score: 80, passed: true, message: "标题清晰", auto_fix: false },
        { name: "标准分类", weight: 0.15, score: 100, passed: true, message: "已设置品类", auto_fix: false },
        { name: "变体属性", weight: 0.15, score: 50, passed: false, message: "缺少颜色属性", auto_fix: false },
        { name: "库存精度", weight: 0.15, score: 70, passed: false, message: "库存 48 小时未更新", auto_fix: false },
        { name: "价格信息", weight: 0.10, score: 100, passed: true, message: "价格数据完整", auto_fix: false },
        { name: "图片质量", weight: 0.10, score: 60, passed: false, message: "仅 1 张图片", auto_fix: false },
        { name: "描述完整度", weight: 0.10, score: 40, passed: false, message: "描述过短", auto_fix: true },
        { name: "Global Catalog", weight: 0.05, score: 0, passed: false, message: "未收录", auto_fix: false },
      ]},
      geo: { score: 75, weight: 0.35, checks: [
        { name: "LLMs.txt 部署", weight: 0.25, score: 100, passed: true, message: "已部署", auto_fix: true },
        { name: "LLMs-full.txt 部署", weight: 0.05, score: 30, passed: false, message: "未部署", auto_fix: true },
        { name: "描述结构化", weight: 0.20, score: 60, passed: false, message: "2/5 产品描述偏短", auto_fix: true },
        { name: "FAQ 模块", weight: 0.15, score: 0, passed: false, message: "未检测到 FAQ", auto_fix: true },
        { name: "标题可搜索性", weight: 0.15, score: 80, passed: true, message: "标题包含具体属性", auto_fix: false },
        { name: "评价数据结构化", weight: 0.15, score: 90, passed: true, message: "有 45 条评价", auto_fix: false },
        { name: "品牌权威性", weight: 0.10, score: 85, passed: true, message: "4/5 产品有品牌", auto_fix: false },
      ]},
      seo: { score: 68, weight: 0.25, checks: [
        { name: "页面加载速度", weight: 0.25, score: 70, passed: false, message: "2 个产品图超过 5 张", auto_fix: false },
        { name: "Canonical URL", weight: 0.20, score: 80, passed: true, message: "已检测", auto_fix: false },
        { name: "Schema JSON-LD", weight: 0.20, score: 80, passed: true, message: "6 个产品 Schema 可生成", auto_fix: true },
        { name: "Meta 标签", weight: 0.15, score: 60, passed: false, message: "2 个产品标题偏短", auto_fix: true },
        { name: "图片 Alt 标签", weight: 0.10, score: 90, passed: true, message: "Shopify 自动设置", auto_fix: false },
        { name: "移动端适配", weight: 0.10, score: 100, passed: true, message: "Shopify 主题默认支持", auto_fix: false },
      ]},
      issues: [
        { severity: "critical", dimension: "ucp", check_name: "变体属性", message: "缺少颜色属性", auto_fix: false, fix_action: "ucp:变体属性" },
        { severity: "critical", dimension: "geo", check_name: "FAQ 模块", message: "未检测到 FAQ 内容", auto_fix: true, fix_action: "geo:FAQ 模块" },
        { severity: "warning", dimension: "ucp", check_name: "描述完整度", message: "描述过短", auto_fix: true, fix_action: "ucp:描述完整度" },
        { severity: "warning", dimension: "geo", check_name: "描述结构化", message: "2/5 产品描述偏短", auto_fix: true, fix_action: "geo:描述结构化" },
        { severity: "info", dimension: "seo", check_name: "页面加载速度", message: "2 个产品图超过 5 张", auto_fix: false },
      ],
    } as T;
  }

  if (path.startsWith("/api/visibility/product")) {
    return {
      product_id: qs("product_id") || "1", title: "Sample Product", overall: 65,
      ucp: { score: 65, weight: 0.40, checks: [
        { name: "标题具象度", weight: 0.20, score: 80, passed: true, message: "标题清晰", auto_fix: false },
        { name: "标准分类", weight: 0.15, score: 100, passed: true, message: "已设置品类", auto_fix: false },
        { name: "变体属性", weight: 0.15, score: 50, passed: false, message: "缺少颜色", auto_fix: false },
        { name: "库存精度", weight: 0.15, score: 70, passed: false, message: "库存未更新", auto_fix: false },
        { name: "价格信息", weight: 0.10, score: 100, passed: true, message: "价格完整", auto_fix: false },
        { name: "图片质量", weight: 0.10, score: 60, passed: false, message: "仅 1 张", auto_fix: false },
        { name: "描述完整度", weight: 0.10, score: 40, passed: false, message: "描述过短", auto_fix: true },
        { name: "Global Catalog", weight: 0.05, score: 0, passed: false, message: "未收录", auto_fix: false },
      ]},
      geo: { score: 0, weight: 0.35, checks: [] },
      seo: { score: 0, weight: 0.25, checks: [] },
      issues: [
        { severity: "critical", dimension: "ucp", check_name: "变体属性", message: "缺少颜色属性", auto_fix: false },
        { severity: "warning", dimension: "ucp", check_name: "描述完整度", message: "描述过短", auto_fix: true },
      ],
    } as T;
  }

  if (path.startsWith("/api/visibility/llmstxt")) {
    return {
      success: true,
      content: "# test-store.myshopify.com\n\n> AI-powered commerce store\n\n## Featured Products\n\n- [Sample Product](https://test-store.myshopify.com/products/): Sample Product — $29.99 | Brand: Nike | Category: Clothing\n\n## Policies\n\n- [Shipping Policy](https://test-store.myshopify.com/policies/shipping-policy)\n- [Return Policy](https://test-store.myshopify.com/policies/refund-policy)\n- [Privacy Policy](https://test-store.myshopify.com/policies/privacy-policy)\n\n## Machine-Readable Feeds\n\n- [JSON-LD Product Feed](https://test-store.myshopify.com/apps/vela/api/geo/feed)\n- [llms-full.txt](https://test-store.myshopify.com/llms-full.txt)",
      full_content: "# Full Catalog\n\n## Product 1: Sample Product\n\n**Description:** A sample product for testing.",
      product_count: 1,
      sections: ["Store Info", "Featured Products", "Policies", "Product Feed"],
      generated_at: "2026-06-08T12:00:00Z",
    } as T;
  }

  if (path.startsWith("/api/geo/settings")) {
    return { enabled: true, product_count: 6, last_generated: "2026-06-08T12:00:00Z", feed_url: "https://test-store.myshopify.com/apps/vela/api/geo/feed" } as T;
  }

  return null;
}

export async function vtronApi<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE}${path}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options?.headers as Record<string, string>) || {}),
  };

  if (API_TOKEN) {
    headers["Authorization"] = `Bearer ${API_TOKEN}`;
  }

  let res: Response;
  try {
    res = await fetch(url, { ...options, headers });
  } catch {
    // Network error (backend not running) — try mock
    const mock = getMockData<T>(path);
    if (mock) return mock;
    throw new Error("Failed to connect to API server");
  }

  if (!res.ok) {
    // Backend returned error (rate limit, etc.) — try mock
    const mock = getMockData<T>(path);
    if (mock) return mock;
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || `API error ${res.status}`);
  }

  return res.json();
}

// ============================================================================
// Phase 1 Typed API Functions
// ============================================================================

import type {
  DailyReportResponse,
  TrendsResponse,
  DashboardResponse,
  NotificationPrefs,
  SetNotificationPrefsRequest,
  TrackEventRequest,
} from "~/types/api";

/** GET /api/insights/daily — Daily Insight Report */
export async function getDailyInsights(shopId: string, date?: string): Promise<DailyReportResponse> {
  const params = new URLSearchParams({ shop_id: shopId });
  if (date) params.set("date", date);
  return vtronApi<DailyReportResponse>(`/api/insights/daily?${params.toString()}`);
}

/** GET /api/insights/trends — Category Trends */
export async function getTrends(shopId: string, category?: string, period?: string): Promise<TrendsResponse> {
  const params = new URLSearchParams({ shop_id: shopId });
  if (category) params.set("category", category);
  if (period) params.set("period", period);
  return vtronApi<TrendsResponse>(`/api/insights/trends?${params.toString()}`);
}

/** POST /api/analytics/events/track — Track AI Event */
export async function trackEvent(shopId: string, eventType: string, payload?: Partial<TrackEventRequest>): Promise<void> {
  const body: TrackEventRequest = { shop_id: shopId, event_type: eventType, ...payload };
  await vtronApi<any>("/api/analytics/events/track", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/** GET /api/analytics/dashboard — Analytics Dashboard */
export async function getDashboard(shopId: string, period?: string): Promise<DashboardResponse> {
  const params = new URLSearchParams({ shop_id: shopId });
  if (period) params.set("period", period);
  return vtronApi<DashboardResponse>(`/api/analytics/dashboard?${params.toString()}`);
}

/** GET /api/notify/preferences — Get Notification Preferences */
export async function getNotificationPrefs(shopId: string): Promise<NotificationPrefs> {
  return vtronApi<NotificationPrefs>(`/api/notify/preferences?shop_id=${shopId}`);
}

/** POST /api/notify/preferences — Set Notification Preferences */
export async function setNotificationPrefs(shopId: string, prefs: Partial<NotificationPrefs>): Promise<void> {
  const body: SetNotificationPrefsRequest = { shop_id: shopId, ...prefs } as SetNotificationPrefsRequest;
  await vtronApi<any>("/api/notify/preferences", {
    method: "POST",
    body: JSON.stringify(body),
  });
}
