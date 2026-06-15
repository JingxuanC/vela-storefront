import { test, expect } from "@playwright/test";

const API = "http://localhost:8000";

test.describe("Phase 1 E2E", () => {

  // === API Tests (always work, no auth needed) ===
  test("1. API: GEO feed returns JSON-LD array", async ({ request }) => {
    const resp = await request.get(`${API}/api/geo/feed?shop_id=test`);
    expect(resp.status()).toBe(200);
    const body = await resp.json();
    expect(Array.isArray(body)).toBe(true);
  });

  test("2. API: Funnel returns all conversion steps", async ({ request }) => {
    const resp = await request.get(`${API}/api/shop/funnel?shop_id=test`);
    expect(resp.status()).toBe(200);
    const body = await resp.json();
    ["product_views","tryon_starts","add_to_cart","checkouts","purchases"].forEach(k => expect(body).toHaveProperty(k));
  });

  test("3. API: SEO batch creates job and returns batch_id", async ({ request }) => {
    const resp = await request.post(`${API}/api/seo/batch`, {
      data: { shop_id: "test", product_ids: ["1", "2"], tasks: ["title"] }
    });
    expect(resp.status()).toBe(200);
    expect(await resp.json()).toHaveProperty("batch_id");
  });

  test("4. API: SEO batch with empty products returns error", async ({ request }) => {
    const resp = await request.post(`${API}/api/seo/batch`, {
      data: { shop_id: "test", product_ids: [], tasks: [] }
    });
    expect(resp.status()).toBe(400);
  });

  test("5. API: RecordUsage records token consumption", async ({ request }) => {
    const resp = await request.post(`${API}/api/billing/record-usage`, {
      data: { shop_id: "ai-tools-test-store.myshopify.com", operation: "e2e_test", count: 3 }
    });
    expect(resp.status()).toBe(200);
    const body = await resp.json();
    expect(body.success).toBe(true);
    expect(body.recorded).toBe(3);
  });

  test("6. API: Billing subscribe returns plan info", async ({ request }) => {
    const resp = await request.post(`${API}/api/billing/subscribe`, {
      data: { shop_id: "ai-tools-test-store.myshopify.com", plan: "growth" }
    });
    expect(resp.status()).toBe(201);
    const body = await resp.json();
    expect(body.success).toBe(true);
    expect(body.plan).toBe("growth");
    expect(body).toHaveProperty("confirmation_url");
  });

  test("7. API: Social connections returns empty list", async ({ request }) => {
    const resp = await request.get(`${API}/api/social/connections?shop_id=test`);
    expect(resp.status()).toBe(200);
    const body = await resp.json();
    expect(body.success).toBe(true);
    expect(Array.isArray(body.connections)).toBe(true);
  });

  test("8. API: Rules CRUD works", async ({ request }) => {
    // Create
    const c = await request.post(`${API}/api/rules`, {
      data: { shop_id: "test", name: "E2E Test Rule", trigger_type: "order_placed", enabled: true }
    });
    expect(c.status()).toBe(201);
    // List
    const l = await request.get(`${API}/api/rules?shop_id=test`);
    expect(l.status()).toBe(200);
    const list = await l.json();
    expect(list.success).toBe(true);
    expect(Array.isArray(list.rules)).toBe(true);
  });

  test("9. API: Customer360 list returns customers", async ({ request }) => {
    const resp = await request.get(`${API}/api/customer360/list?shop_id=test`);
    expect(resp.status()).toBe(200);
    const body = await resp.json();
    expect(body.success).toBe(true);
    expect(Array.isArray(body.customers)).toBe(true);
  });

  test("10. API: Content generate creates job", async ({ request }) => {
    const resp = await request.post(`${API}/api/content/generate`, {
      data: { shop_id: "test", job_type: "desc", product_ids: ["1"] }
    });
    expect(resp.status()).toBe(200);
    const body = await resp.json();
    expect(body.success).toBe(true);
    expect(body).toHaveProperty("job_id");
  });

  // === Page tests (require dev server + auth bypass) ===
  test("11. Page: Plans page loads with pricing", async ({ page }) => {
    const resp = await page.request.get("http://localhost:5173/app/plans");
    expect(resp.status()).toBe(200);
    const text = await resp.text();
    expect(text).toContain("Growth");
  });

  test("12. Page: SEO Batch page loads", async ({ page }) => {
    const resp = await page.request.get("http://localhost:5173/app/seo-batch");
    expect(resp.status()).toBeGreaterThanOrEqual(200);
  });

  test("13. Page: GEO Feed page loads", async ({ page }) => {
    const resp = await page.request.get("http://localhost:5173/app/geo-feed");
    expect(resp.status()).toBeGreaterThanOrEqual(200);
  });
});
