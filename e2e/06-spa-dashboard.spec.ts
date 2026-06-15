import { test, expect } from "@playwright/test";

test.describe("SPA Dashboard — Refined UI", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("**/api/analytics/ai-summary**", route => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({
      success: true, summary: {
        date: "2026-06-12", replies_generated: 42, replies_published: 38, replies_failed: 4,
        discount_codes_sent: 15, recovery_revenue: 1280, chat_conversations: 245,
        purchase_intents: 18, discounts_issued: 12, products_recommended: 156,
        content_generated: 34, content_published: 12, total_api_calls: 12420,
        total_tokens_in: 500000, total_tokens_out: 200000, estimated_cost_usd: 0.02,
        returns_handled: 18, exchange_recommendations: 7,
      }
    })}));
    await page.route("**/api/analytics/attribution**", route => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({
      success: true, total_revenue: 12500, total_orders: 87,
      channel_summary: [
        { channel: "social", attributed_revenue: 4200, percentage: 33.6, touchpoint_count: 120 },
        { channel: "direct", attributed_revenue: 3800, percentage: 30.4, touchpoint_count: 200 },
        { channel: "vela_ai", attributed_revenue: 2000, percentage: 16.0, touchpoint_count: 35 },
      ]
    })}));
  });

  test("loads with page title and stat cards", async ({ page }) => {
    await page.goto("/app", { waitUntil: "domcontentloaded" });
    await expect(page.locator(".page-title")).toContainText("Daily Briefing");
    await expect(page.locator(".stat-label")).toHaveCount(5);
  });

  test("displays 4 KPI cards with correct labels", async ({ page }) => {
    await page.goto("/app", { waitUntil: "domcontentloaded" });
    await expect(page.locator(".kpi-card")).toHaveCount(4);
    for (const label of ["Sales Chats", "Auto Replies", "Content Generated", "Returns Handled"])
      await expect(page.locator(`.kpi-card:has-text("${label}")`)).toBeVisible();
  });

  test("shows channel attribution with progress bars", async ({ page }) => {
    await page.goto("/app", { waitUntil: "domcontentloaded" });
    await expect(page.locator("text=Channel Attribution")).toBeVisible();
    await expect(page.locator(".attr-bar-fill").first()).toBeVisible();
  });

  test("detail section cards are visible", async ({ page }) => {
    await page.goto("/app", { waitUntil: "domcontentloaded" });
    for (const title of ["Auto Reply", "Sales Agent", "Content Factory", "AI Usage"])
      await expect(page.locator(`.section-title:has-text("${title}")`)).toBeVisible();
  });

  test("sidebar navigation renders", async ({ page }) => {
    await page.goto("/app", { waitUntil: "domcontentloaded" });
    await expect(page.locator(".sidebar")).toBeVisible();
    await expect(page.locator(".sidebar-link:has-text('Dashboard')")).toBeVisible();
    await expect(page.locator(".sidebar-link:has-text('Settings')")).toBeVisible();
    await expect(page.locator(".sidebar-link.active")).toBeVisible();
  });
});
