// =============================================================================
// Phase 1 API Type Definitions
// Shared TypeScript types for Vela AI Go backend API contracts.
// Auto-generated — keep in sync with internal/handler/*.go struct definitions.
// =============================================================================

// =============================================================================
// Shared / Common
// =============================================================================

/** Standard API error response body. */
export interface ApiError {
  detail: string;
}

// =============================================================================
// GET /api/insights/daily — Daily Insight Report
// =============================================================================

/** Query parameters for GET /api/insights/daily. */
export interface DailyReportQuery {
  /** Shopify store domain or UUID. */
  shop_id: string;
  /** Report date in YYYY-MM-DD format. Defaults to yesterday. */
  date?: string;
}

/** Response payload for GET /api/insights/daily. */
export interface DailyReportResponse {
  success: boolean;
  /** Report date in YYYY-MM-DD format. */
  date: string;
  /** Shopify store identifier. */
  shop_id: string;
  /** Natural-language 2–3 sentence summary. */
  summary: string;
  /** List of positive outcomes or highlights. */
  highlights: string[];
  /** Concrete next-step action items. */
  action_items: string[];
  /** Total unit sales for the date. */
  daily_sales: number;
  /** Total revenue for the date. */
  daily_revenue: number;
  /** Error message if the request failed. */
  error?: string;
}

// =============================================================================
// GET /api/insights/trends — Category Trends (Google Trends)
// =============================================================================

/** Query parameters for GET /api/insights/trends. */
export interface TrendsQuery {
  /** Optional category filter (e.g. "dresses", "shoes"). */
  category?: string;
  /** Time window: 7d, 30d, 90d. Default: 7d. */
  period?: string;
}

/** A single category trend entry. */
export interface TrendItem {
  /** Trend category / product category name. */
  category: string;
  /** Direction: "up" | "down" | "flat". */
  direction: string;
  /** Percentage change or confidence. */
  percentage: number;
  /** Human-readable description of the trend. */
  description: string;
  /** Data source identifier: "google_trends" | "internal". */
  source: string;
}

/** Response payload for GET /api/insights/trends. */
export interface TrendsResponse {
  success: boolean;
  /** List of detected trends. */
  trends: TrendItem[];
  /** Time window used. */
  period: string;
  /** Error message if the request failed. */
  error?: string;
}

// =============================================================================
// GET /api/notify/preferences — Get Notification Preferences
// =============================================================================

/** Query parameters for GET /api/notify/preferences. */
export interface NotificationPrefsQuery {
  /** Shopify store domain or UUID. */
  shop_id: string;
}

/** A shop's notification preference settings. */
export interface NotificationPrefs {
  /** Shopify store identifier. */
  shop_id: string;
  /** Email alerts for return updates. */
  email_return_updates: boolean;
  /** Email alerts for API usage thresholds. */
  email_usage_alerts: boolean;
  /** Marketing / promotional emails. */
  email_marketing: boolean;
  /** In-app toast / bell notifications. */
  in_app_notifications: boolean;
}

// =============================================================================
// POST /api/notify/preferences — Set Notification Preferences
// =============================================================================

/** Request body for POST /api/notify/preferences. */
export interface SetNotificationPrefsRequest {
  /** Shopify store domain or UUID. */
  shop_id: string;
  /** Email alerts for return updates. */
  email_return_updates: boolean;
  /** Email alerts for API usage thresholds. */
  email_usage_alerts: boolean;
  /** Marketing / promotional emails. */
  email_marketing: boolean;
  /** In-app toast / bell notifications. */
  in_app_notifications: boolean;
}

/** Response payload for POST /api/notify/preferences. */
export interface SetNotificationPrefsResponse {
  success: boolean;
  message: string;
}

// =============================================================================
// POST /api/analytics/events/track — AI Interaction Event Ingest
// =============================================================================

/** Request body for POST /api/analytics/events/track. */
export interface TrackEventRequest {
  /** Shopify store domain or UUID. */
  shop_id: string;
  /** Event type identifier (e.g. "ai_tryon_click", "ai_chat_interaction"). */
  event_type: string;
  /** Optional customer identifier. */
  customer_id?: string;
  /** Marketing or attribution channel (default: "direct"). */
  channel?: string;
  /** Traffic source (e.g. "google", "shopify_email"). */
  source?: string;
  /** Traffic medium (e.g. "cpc", "email", "organic"). */
  medium?: string;
  /** Arbitrary JSON metadata string for extra context. */
  metadata?: string;
}

/** Response payload for POST /api/analytics/events/track. */
export interface TrackEventResponse {
  success: boolean;
  /** Unique event ID assigned by the backend. */
  event_id?: string;
  /** Error message if the request failed. */
  error?: string;
}

// =============================================================================
// GET /api/analytics/dashboard — Analytics Dashboard
// =============================================================================

/** Query parameters for GET /api/analytics/dashboard. */
export interface DashboardQuery {
  /** Shopify store domain or UUID. */
  shop_id: string;
  /** Time window: 7d, 30d, 90d. Default: 30d. */
  period?: string;
}

/** A single KPI metric on the analytics dashboard. */
export interface DashboardMetric {
  /** Human-readable label (e.g. "Return Rate", "Avg Order Value"). */
  label: string;
  /** Current numeric value. */
  value: number;
  /** Percentage change vs previous period. */
  change: number;
  /** Direction: "up" | "down" | "flat". */
  trend: string;
  /** Unit suffix: "%" | "$" | "count" | "" */
  unit: string;
}

/** Stock status for a single product or category. */
export interface InventoryStatusItem {
  /** Product platform ID. */
  product_id: string;
  /** Product display name. */
  product_name: string;
  /** Current stock count. */
  stock_level: number;
  /** Threshold at which reorder is recommended. */
  reorder_at: number;
  /** Status: "healthy" | "low" | "out_of_stock". */
  status: string;
}

/** A single sales data point for trend charts. */
export interface SalesTrendPoint {
  /** Date string in YYYY-MM-DD format. */
  date: string;
  /** Number of units sold on this date. */
  sales: number;
  /** Revenue generated on this date. */
  revenue: number;
}

/** Aggregated return reason statistics. */
export interface ReturnReasonStat {
  /** Return reason label (e.g. "size_too_small", "defect"). */
  reason: string;
  /** Number of returns with this reason. */
  count: number;
  /** Ratio as percentage (0–100). */
  ratio: number;
}

/** Full analytics dashboard payload. */
export interface DashboardResponse {
  success: boolean;
  /** Overall return rate as percentage (0–100). */
  return_rate: number;
  /** Return rate percentage change vs previous period. */
  return_rate_change: number;
  /** Total inventory count across all products. */
  total_inventory: number;
  /** Number of products with stock below reorder threshold. */
  low_stock_items: number;
  /** Number of products completely out of stock. */
  out_of_stock_items: number;
  /** Daily sales trend over the selected period. */
  sales_trend: SalesTrendPoint[];
  /** Top return reasons ranked by frequency. */
  top_return_reasons: ReturnReasonStat[];
  /** Per-product inventory status breakdown. */
  inventory_breakdown: InventoryStatusItem[];
  /** List of high-level KPI metrics. */
  metrics: DashboardMetric[];
  /** Time window used for the dashboard data. */
  period: string;
}
