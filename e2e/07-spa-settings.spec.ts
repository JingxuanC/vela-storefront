import { test, expect } from "@playwright/test";

test.describe("SPA Settings — Refined UI", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("**/api/llm/config**", route => {
      if (route.request().method() === "GET") return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({
        success: true, provider: "deepseek", model: "deepseek-chat", api_key_masked: "", has_custom_key: false, plan: "growth",
        available_models: [
          { id: "deepseek-chat", name: "DeepSeek Chat", description: "Fast general-purpose", locked: false },
          { id: "deepseek-reasoner", name: "DeepSeek Reasoner", description: "Deep reasoning (R1)", locked: false },
          { id: "qwen-plus", name: "Qwen Plus", description: "Balanced performance", locked: false },
        ],
      })});
      return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true }) });
    });
  });

  test("loads with title and form controls", async ({ page }) => {
    await page.goto("/app/settings", { waitUntil: "domcontentloaded" });
    await expect(page.locator(".page-title")).toContainText("Settings");
    await expect(page.locator(".form-select")).toHaveCount(2);
    await expect(page.locator(".btn-primary")).toBeVisible();
  });

  test("switching provider filters models", async ({ page }) => {
    await page.goto("/app/settings", { waitUntil: "domcontentloaded" });
    await page.locator(".form-select").first().selectOption("dashscope");
    const modelSelect = page.locator(".form-select").nth(1);
    await expect(modelSelect.locator("option")).toContainText("Qwen Plus");
  });

  test("save button shows success feedback", async ({ page }) => {
    await page.goto("/app/settings", { waitUntil: "domcontentloaded" });
    await page.locator(".btn-primary").click();
    await expect(page.locator(".banner-success")).toBeVisible();
  });
});
