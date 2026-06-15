import { test, expect } from "@playwright/test";
const API = "http://localhost:8000";

test.describe("Phase 3 E2E", () => {
  test("1. Multi-store groups returns array", async ({ request }) => {
    const r = await request.get(`${API}/api/multi-store/groups?shop_id=test`);
    expect(r.status()).toBe(200);
    const b = await r.json();
    expect(Array.isArray(b.groups)).toBe(true);
  });
  test("2. Multi-store create requires name", async ({ request }) => {
    const r = await request.post(`${API}/api/multi-store/groups`, { data: { shop_id: "00000000-0000-0000-0000-000000000001", name: "" } });
    expect(r.status()).toBe(400);
  });
  test("3. Multi-store create succeeds with name", async ({ request }) => {
    const r = await request.post(`${API}/api/multi-store/groups`, { data: { shop_id: "00000000-0000-0000-0000-000000000001", name: "Test Group" } });
    expect(r.status()).toBe(201);
    const b = await r.json();
    expect(b.success).toBe(true);
    expect(b).toHaveProperty("id");
  });
  test("4. Enterprise keys list returns array", async ({ request }) => {
    const r = await request.get(`${API}/api/enterprise/keys?shop_id=test`);
    expect(r.status()).toBe(200);
    const b = await r.json();
    expect(Array.isArray(b.keys)).toBe(true);
  });
  test("5. Enterprise key create requires label", async ({ request }) => {
    const r = await request.post(`${API}/api/enterprise/keys`, { data: { shop_id: "00000000-0000-0000-0000-000000000001", label: "E2E Test Key", scopes: ["read:products"], rate_limit: 60 } });
    expect(r.status()).toBe(201);
    const b = await r.json();
    expect(b.success).toBe(true);
    expect(b).toHaveProperty("full_key");
  });
  test("6. Analytics track event succeeds", async ({ request }) => {
    const r = await request.post(`${API}/api/analytics/events/track`, {
      data: { shop_id: "test", customer_id: "c1", event_type: "page_view", channel: "organic" }
    });
    expect(r.status()).toBe(201);
  });
  test("7. Analytics attribution returns data", async ({ request }) => {
    const r = await request.get(`${API}/api/analytics/attribution?shop_id=test&model=first_touch`);
    expect(r.status()).toBe(200);
    const b = await r.json();
    expect(b).toHaveProperty("channel_summary");
  });
  test("8. Churn predictions returns array", async ({ request }) => {
    const r = await request.get(`${API}/api/analytics/predictions/churn?shop_id=test`);
    expect(r.status()).toBe(200);
    const b = await r.json();
    expect(Array.isArray(b.predictions)).toBe(true);
  });
  test("9. YouTube status returns connected:false", async ({ request }) => {
    const r = await request.get(`${API}/api/social/youtube/status?shop_id=test`);
    expect(r.status()).toBe(200);
    const b = await r.json();
    expect(b.connected).toBe(false);
  });
  test("10. Meta status returns connected:false", async ({ request }) => {
    const r = await request.get(`${API}/api/social/meta/status?shop_id=test`);
    expect(r.status()).toBe(200);
    const b = await r.json();
    expect(b.connected).toBe(false);
  });
});
