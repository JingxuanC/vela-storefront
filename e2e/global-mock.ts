/**
 * Global API mock for E2E tests.
 *
 * Intercepts all /api/* calls before they reach the Go backend,
 * fulfilling them with empty 200 responses or structured mock data.
 *
 * Import addApiMocks(page) in every test file's beforeEach.
 */

import type { Page } from "@playwright/test";

// ── route categories ──────────────────────────────────────────────────────────

const EMPTY_OK = () => ({ status: 200, contentType: "application/json", body: "{}" });

const DATA = {
  "usage":       { usage: 42, limit: 1000, period: "monthly", per_service: { "cart-recovery": { usage: 5, limit: 1000 } } },
  "quota":       { "cart-recovery": { limit: 1000, used: 5, remaining: 995 } },
  "plans":       { plans: [{ id: "free", name: "Free", price: 0 }, { id: "growth", name: "Growth", price: 49 }, { id: "pro", name: "Pro", price: 149 }], current: "free" },
  "billing":     { status: "active", nextPayment: new Date().toISOString(), amount: 0 },
  "notifications": { items: [], unread: 0 },
  "kpis":        { totalOrders: 1284, revenue: 48200, conversionRate: 3.2, avgOrderValue: 37.50 },
  "features":    [{ id: "ai-reply", name: "AI Auto Reply", enabled: true },
                  { id: "smart-tagging", name: "Smart Tagging", enabled: false },
                  { id: "review-summary", name: "Review Summary", enabled: true }],
  "products":    { products: [{ id: "1", title: "Sample Product", status: "active" }], total: 1 },
  "returns":     { returns: [], total: 0 },
  "exchanges":   { exchanges: [], total: 0 },
  "recommendations": { items: [], total: 0 },
  "cart-recovery": { campaigns: [{ id: "1", name: "Test Campaign", status: "active", createdAt: new Date().toISOString() }], total: 1 },
  "cart-recovery/analytics/overview": {
    revenue_recovered: 4820.50,
    orders_recovered: 124,
    emails_sent: 1850,
    recovery_rate: 12.8,
    total_abandoned: 968,
  },
  "cart-recovery/analytics/funnel": {
    abandoned: 968,
    sent: 920,
    opened: 552,
    used: 215,
    recovered: 124,
  },
  "cart-recovery/analytics/campaigns": {
    campaigns: [
      { id: "c1", name: "1-Hour Flash Recovery", revenue: 1840.20, orders: 52, rate: 15.3, sent: 680 },
      { id: "c2", name: "24-Hour Reminder", revenue: 2210.80, orders: 58, rate: 11.2, sent: 790 },
      { id: "c3", name: "48-Hour Last Chance", revenue: 769.50, orders: 14, rate: 6.8, sent: 380 },
    ],
  },
  "cart-recovery/analytics/trend": {
    daily: [
      { date: "2026-06-04", revenue: 680.50, orders: 18, emails_sent: 250 },
      { date: "2026-06-05", revenue: 720.00, orders: 19, emails_sent: 260 },
      { date: "2026-06-06", revenue: 540.30, orders: 14, emails_sent: 240 },
      { date: "2026-06-07", revenue: 810.20, orders: 22, emails_sent: 280 },
      { date: "2026-06-08", revenue: 690.80, orders: 17, emails_sent: 265 },
      { date: "2026-06-09", revenue: 750.40, orders: 20, emails_sent: 275 },
      { date: "2026-06-10", revenue: 628.30, orders: 14, emails_sent: 280 },
    ],
  },
  "settings":    { theme: "light", locale: "en" },
  "shop/sales-agent/stats": {
    totalConversations: 1247,
    productsRecommended: 342,
    discountsGenerated: 89,
    intentToBuy: 215,
    topProducts: [
      { name: "Summer Floral Dress", recommended: 142, purchased: 23 },
      { name: "Linen Shirt", recommended: 98, purchased: 15 },
      { name: "Denim Jacket", recommended: 76, purchased: 11 },
      { name: "Summer Sandals", recommended: 64, purchased: 28 },
      { name: "Silk Scarf", recommended: 51, purchased: 3 },
    ],
    topObjections: [
      { reason: "price_objection", count: 45 },
      { reason: "size_preference", count: 32 },
      { reason: "color_preference", count: 18 },
      { reason: "discount_request", count: 15 },
      { reason: "intent_high_no_purchase", count: 12 },
    ],
  },
  "shop/sales-agent/config": {
    enabled: true,
    welcome_message: "Hi! Welcome to our store. What are you looking for today? 👋",
    brand_voice: "friendly",
  },
  "reviews":     { reviews: [], total: 0 },
  "insights/daily": {
    success: true,
    date: "2026-06-08",
    shop_id: "test-store.myshopify.com",
    summary: "Sales increased 12% compared to yesterday. Top category was tops with 34 units sold.",
    highlights: ["Revenue up 15% week-over-week", "New customer acquisition increased 8%", "Return rate dropped to 3.2%"],
    action_items: ["Restock best-selling items in tops category", "Review return reasons for size issues", "Update product descriptions for low-converting items"],
    daily_sales: 128,
    daily_revenue: 4560.50,
  },
  "insights/trends": {
    success: true,
    trends: [
      { category: "tops", direction: "up", percentage: 12.5, description: "Tops trending upward this week", source: "google_trends" },
      { category: "dresses", direction: "up", percentage: 8.3, description: "Summer dress demand increasing", source: "google_trends" },
      { category: "shoes", direction: "down", percentage: -3.1, description: "Footwear interest declining", source: "google_trends" },
      { category: "accessories", direction: "flat", percentage: 0.5, description: "Accessories holding steady", source: "internal" },
    ],
    period: "7d",
  },
  "analytics/dashboard": {
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
    period: "7d",
  },
  "analytics/content-performance": {
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
  },
  "content/pieces": {
    pieces: [
      { id: "cp-001", status: "published" },
      { id: "cp-002", status: "published" },
      { id: "cp-003", status: "published" },
      { id: "cp-004", status: "generated" },
      { id: "cp-005", status: "generated" },
    ],
    total: 5,
  },
  "notify/preferences": {
    shop_id: "test-store.myshopify.com",
    email_return_updates: true,
    email_usage_alerts: false,
    email_marketing: false,
    in_app_notifications: true,
  },
  "integrations/judgeme/status": {
    success: true,
    connected: true,
    shop_domain: "test-store.judge.me",
    connected_at: "2026-06-01T10:00:00Z",
    last_sync_at: "2026-06-08T08:00:00Z",
    is_active: true,
  },
  "integrations/judgeme/logs": {
    success: true,
    logs: [
      { id: "1", action: "full_sync", status: "success", message: "Synced 156 reviews", reviews_count: 156, created_at: "2026-06-08T08:00:00Z" },
      { id: "2", action: "webhook", status: "success", message: "Processed review #1234", reviews_count: 1, created_at: "2026-06-08T07:30:00Z" },
    ],
    total: 2,
  },
  "review/replies": {
    success: true,
    replies: [
      {
        id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        shop_id: "test-store.myshopify.com",
        review_id: "judgeme-1234",
        product_id: "1",
        customer_name: "Alice Johnson",
        customer_email: "alice@example.com",
        rating: 1,
        review_title: "Way too small",
        review_body: "Ordered a Medium but it fits like an XS. Very disappointed.",
        sentiment_score: 0.85,
        ai_replies: [
          "Dear Alice, we're very sorry about the sizing issue. Our team will reach out to arrange a replacement.",
          "Thank you for your feedback, Alice! We're experiencing some sizing inconsistencies that we're working to fix.",
          "Hi Alice, we appreciate your honesty. Our customer service team will contact you shortly with a resolution.",
        ],
        final_reply: "",
        status: "pending",
        send_mode: "manual",
        created_at: "2026-06-08T09:00:00Z",
        updated_at: "2026-06-08T09:00:00Z",
      },
      {
        id: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
        shop_id: "test-store.myshopify.com",
        review_id: "judgeme-5678",
        product_id: "2",
        customer_name: "Bob Smith",
        customer_email: "bob@example.com",
        rating: 2,
        review_title: "Decent but not great",
        review_body: "The quality is okay but definitely not worth the $45 price tag.",
        sentiment_score: 0.55,
        ai_replies: [
          "Hi Bob, thank you for your honest review. We'd love to offer you a discount on your next purchase.",
          "Thanks Bob, we're constantly working on improving quality at every price point.",
          "We hear you, Bob. Our team reviews pricing regularly based on customer feedback like yours.",
        ],
        final_reply: "Hi Bob, thank you for your honest review. We'd love to offer you a discount on your next purchase.",
        status: "sent",
        send_mode: "auto",
        sent_at: "2026-06-07T15:00:00Z",
        created_at: "2026-06-07T14:30:00Z",
        updated_at: "2026-06-07T15:00:00Z",
      },
    ],
    total: 2,
    limit: 20,
    offset: 0,
  },
  "admin/chat/ask": {
    success: true,
    answer: "Your return rate is 8.2% over the last 30 days, which is within normal range. The top return reason is 'size_too_small' (45 returns). Cotton Tee L has only 3 units left — consider restocking. Dresses category is trending +85% on Google Trends.",
    suggested_questions: [
      "Which products have the highest return rate?",
      "What sizes are being returned most?",
      "How does this compare to last month?",
    ],
  },
  "admin/chat/summary": {
    success: true,
    answer: "Good morning! Yesterday you had 128 orders (+12% vs last week). Return rate is stable at 8.2%. Cotton Tee L is running low — only 3 left. Dresses are trending up 85% — you're well stocked.",
    daily_summary: {
      return_rate: 8.2,
      order_count: 128,
      top_categories: ["Dresses", "Tops", "Shoes"],
      alerts: ["Cotton Tee L low stock: 3 remaining", "Return rate normal"],
      generated_at: "2026-06-10T08:00:00Z",
    },
    suggested_questions: [
      "What categories are trending up?",
      "Any inventory alerts?",
      "Which products have the highest return rate?",
    ],
  },
  "review/settings": {
    success: true,
    mode: "manual",
    auto_send_threshold: 3,
    require_approval: true,
    reply_language: "auto",
    default_reply_style: "professional",
  },
  "visibility/score": {
    overall: 72,
    grade: "good",
    scanned_at: "2026-06-08T12:00:00Z",
    ucp: {
      score: 65,
      weight: 0.40,
      checks: [
        { name: "标题具象度", weight: 0.20, score: 80, passed: true, message: "标题清晰", auto_fix: false },
        { name: "标准分类", weight: 0.15, score: 100, passed: true, message: "已设置品类：Clothing", auto_fix: false },
        { name: "变体属性", weight: 0.15, score: 50, passed: false, message: "缺少颜色属性", auto_fix: false },
        { name: "库存精度", weight: 0.15, score: 70, passed: false, message: "库存 48 小时未更新", auto_fix: false },
        { name: "价格信息", weight: 0.10, score: 100, passed: true, message: "价格数据完整", auto_fix: false },
        { name: "图片质量", weight: 0.10, score: 60, passed: false, message: "仅 1 张图片", auto_fix: false },
        { name: "描述完整度", weight: 0.10, score: 40, passed: false, message: "描述过短", auto_fix: true },
        { name: "Global Catalog", weight: 0.05, score: 0, passed: false, message: "未收录", auto_fix: false },
      ],
    },
    geo: {
      score: 75,
      weight: 0.35,
      checks: [
        { name: "LLMs.txt 部署", weight: 0.25, score: 100, passed: true, message: "已部署", auto_fix: true },
        { name: "LLMs-full.txt 部署", weight: 0.05, score: 30, passed: false, message: "未部署", auto_fix: true },
        { name: "描述结构化", weight: 0.20, score: 60, passed: false, message: "2/5 产品描述偏短", auto_fix: true },
        { name: "FAQ 模块", weight: 0.15, score: 0, passed: false, message: "未检测到 FAQ", auto_fix: true },
        { name: "标题可搜索性", weight: 0.15, score: 80, passed: true, message: "标题包含具体属性", auto_fix: false },
        { name: "评价数据结构化", weight: 0.15, score: 90, passed: true, message: "有 45 条评价", auto_fix: false },
        { name: "品牌权威性", weight: 0.10, score: 85, passed: true, message: "4/5 产品有品牌", auto_fix: false },
      ],
    },
    seo: {
      score: 68,
      weight: 0.25,
      checks: [
        { name: "页面加载速度", weight: 0.25, score: 70, passed: false, message: "2 个产品图超过 5 张", auto_fix: false },
        { name: "Canonical URL", weight: 0.20, score: 80, passed: true, message: "已检测", auto_fix: false },
        { name: "Schema JSON-LD", weight: 0.20, score: 80, passed: true, message: "6 个产品 Schema 可生成", auto_fix: true },
        { name: "Meta 标签", weight: 0.15, score: 60, passed: false, message: "2 个产品标题偏短", auto_fix: true },
        { name: "图片 Alt 标签", weight: 0.10, score: 90, passed: true, message: "Shopify 自动设置", auto_fix: false },
        { name: "移动端适配", weight: 0.10, score: 100, passed: true, message: "Shopify 主题默认支持", auto_fix: false },
      ],
    },
    issues: [
      { severity: "critical", dimension: "ucp", check_name: "变体属性", message: "缺少颜色属性", auto_fix: false, fix_action: "ucp:变体属性" },
      { severity: "critical", dimension: "geo", check_name: "FAQ 模块", message: "未检测到 FAQ 内容", auto_fix: true, fix_action: "geo:FAQ 模块" },
      { severity: "warning", dimension: "ucp", check_name: "描述完整度", message: "描述过短", auto_fix: true, fix_action: "ucp:描述完整度" },
      { severity: "warning", dimension: "geo", check_name: "描述结构化", message: "2/5 产品描述偏短", auto_fix: true, fix_action: "geo:描述结构化" },
      { severity: "info", dimension: "seo", check_name: "页面加载速度", message: "2 个产品图超过 5 张", auto_fix: false },
    ],
  },
  "visibility/product": {
    product_id: "1",
    title: "Sample Product",
    overall: 65,
    ucp: {
      score: 65,
      weight: 0.40,
      checks: [
        { name: "标题具象度", weight: 0.20, score: 80, passed: true, message: "标题清晰", auto_fix: false },
        { name: "标准分类", weight: 0.15, score: 100, passed: true, message: "已设置品类", auto_fix: false },
        { name: "变体属性", weight: 0.15, score: 50, passed: false, message: "缺少颜色", auto_fix: false },
        { name: "库存精度", weight: 0.15, score: 70, passed: false, message: "库存未更新", auto_fix: false },
        { name: "价格信息", weight: 0.10, score: 100, passed: true, message: "价格完整", auto_fix: false },
        { name: "图片质量", weight: 0.10, score: 60, passed: false, message: "仅 1 张", auto_fix: false },
        { name: "描述完整度", weight: 0.10, score: 40, passed: false, message: "描述过短", auto_fix: true },
        { name: "Global Catalog", weight: 0.05, score: 0, passed: false, message: "未收录", auto_fix: false },
      ],
    },
    geo: { score: 0, weight: 0.35, checks: [] },
    seo: { score: 0, weight: 0.25, checks: [] },
    issues: [
      { severity: "critical", dimension: "ucp", check_name: "变体属性", message: "缺少颜色属性", auto_fix: false },
      { severity: "warning", dimension: "ucp", check_name: "描述完整度", message: "描述过短", auto_fix: true },
    ],
  },
  "visibility/llmstxt": {
    success: true,
    content: "# test-store.myshopify.com\n\n> AI-powered commerce store\n\n## Featured Products\n\n- [Sample Product](https://test-store.myshopify.com/products/): Sample Product — $29.99 | Brand: Nike | Category: Clothing\n\n## Policies\n\n- [Shipping Policy](https://test-store.myshopify.com/policies/shipping-policy)\n- [Return Policy](https://test-store.myshopify.com/policies/refund-policy)\n- [Privacy Policy](https://test-store.myshopify.com/policies/privacy-policy)\n\n## Machine-Readable Feeds\n\n- [JSON-LD Product Feed](https://test-store.myshopify.com/apps/vela/api/geo/feed)\n- [llms-full.txt](https://test-store.myshopify.com/llms-full.txt)",
    full_content: "# Full Catalog\n\n## Product 1: Sample Product\n\n**Description:** A sample product for testing.",
    product_count: 1,
    sections: ["Store Info", "Featured Products", "Policies", "Product Feed"],
    generated_at: "2026-06-08T12:00:00Z",
  },
};

/**
 * Register API route mocks on the given page.
 * Call this in every describe block's beforeAll or beforeEach.
 */
export async function addApiMocks(page: Page): Promise<void> {
  await page.route("**/api/*", (route) => {
    const url = route.request().url();
    const method = route.request().method();

    // Auto-reply bounce: return 200 for any POST
    if (method !== "GET") {
      // Special handling for streaming endpoints
      if (url.includes("/api/admin/chat/stream")) {
        const sseData = [
          'data: {"token":"Hello! "}',
          'data: {"token":"Your return rate is 8.2%. "}',
          'data: {"token":"Top category: dresses trending +85%. "}',
          'data: {"token":"Cotton Tee L is low stock."}',
          'data: {"done":true,"suggested":["Which products have the highest return rate?","What sizes are being returned most?","How does this compare to last month?"]}',
          "data: [DONE]",
        ].join("\n\n") + "\n\n";
        return route.fulfill({
          status: 200,
          contentType: "text/event-stream",
          body: sseData,
        });
      }
      return route.fulfill(EMPTY_OK());
    }

    // Match known data keys
    for (const [key, data] of Object.entries(DATA)) {
      if (url.includes(`/api/${key}`)) {
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(data),
        });
      }
    }

    // Fallback: empty 200
    return route.fulfill(EMPTY_OK());
  });
}
