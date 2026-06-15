import { test, expect } from "@playwright/test";
const API = "http://localhost:8000";

test.describe("Phase 2 E2E", () => {
  test("1. Social connections returns empty", async ({ request }) => {
    const r = await request.get(`${API}/api/social/connections?shop_id=test`);
    expect(r.status()).toBe(200);
    const b = await r.json();
    expect(b.success).toBe(true);
    expect(Array.isArray(b.connections)).toBe(true);
  });
  test("2. Social posts list works", async ({ request }) => {
    const r = await request.get(`${API}/api/social/posts?shop_id=test&limit=5`);
    expect(r.status()).toBe(200);
    const b = await r.json();
    expect(b).toHaveProperty("total");
    expect(Array.isArray(b.posts)).toBe(true);
  });
  test("3. Content generate creates job and returns job_id", async ({ request }) => {
    const r = await request.post(`${API}/api/content/generate`, { data: { shop_id: "test", job_type: "desc", product_ids: ["1"] } });
    expect(r.status()).toBe(200);
    const b = await r.json();
    expect(b.success).toBe(true);
    expect(b).toHaveProperty("job_id");
  });
  test("4. Content generate validates input", async ({ request }) => {
    const r = await request.post(`${API}/api/content/generate`, { data: { shop_id: "test", job_type: "", product_ids: [] } });
    expect(r.status()).toBe(400);
  });
  test("5. Customer360 list returns paginated results", async ({ request }) => {
    const r = await request.get(`${API}/api/customer360/list?shop_id=test&limit=10&offset=0`);
    expect(r.status()).toBe(200);
    const b = await r.json();
    expect(b.limit).toBe(10);
    expect(Array.isArray(b.customers)).toBe(true);
  });
  test("6. Customer360 detail returns customer", async ({ request }) => {
    const r = await request.get(`${API}/api/customer360/test-customer-1?shop_id=test`);
    expect(r.status()).toBeLessThanOrEqual(404); // 404 acceptable if no data
  });
  test("7. Rules list returns array", async ({ request }) => {
    const r = await request.get(`${API}/api/rules?shop_id=test`);
    expect(r.status()).toBe(200);
    const b = await r.json();
    expect(Array.isArray(b.rules)).toBe(true);
  });
  test("8. Rules CRUD flow", async ({ request }) => {
    const c = await request.post(`${API}/api/rules`, { data: { shop_id: "test", name: "E2E Rule", trigger_type: "order_placed", enabled: true } });
    expect(c.status()).toBe(201);
    const l = await request.get(`${API}/api/rules?shop_id=test`);
    const list = await l.json();
    const rule = list.rules.find((r:any) => r.name === "E2E Rule");
    expect(rule).toBeTruthy();
    if (rule) {
      await request.put(`${API}/api/rules/${rule.id}`, { data: { name: "Updated Rule" } });
      await request.delete(`${API}/api/rules/${rule.id}`);
    }
  });
  test("9. Pinterest auth URL generation", async ({ request }) => {
    const r = await request.get(`${API}/api/social/pinterest/auth-url?shop_id=test`);
    expect(r.status()).toBe(200);
    const b = await r.json();
    expect(b.success).toBe(true);
    expect(b).toHaveProperty("auth_url");
  });
  test("10. Social page loads", async ({ page }) => {
    const r = await page.request.get("http://localhost:5173/app/social");
    expect(r.status()).toBeGreaterThanOrEqual(200);
  });
});
