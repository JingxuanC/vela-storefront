import { test, expect } from "@playwright/test";
import { addApiMocks } from "./global-mock";
test.describe("Smoke Test — Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await addApiMocks(page);
    await page.goto("/app/dashboard", { waitUntil: "domcontentloaded" });
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 15000 });
  });

  test("page loads with dashboard title", async ({ page }) => {
    // The dashboard uses VtronPage which renders h1
    const h1 = page.locator("h1");
    await expect(h1).toBeVisible({ timeout: 15000 });

    // Title should contain Hello or Dashboard (or at least not be empty)
    const text = await h1.textContent();
    expect(text).toBeTruthy();
  });

  test("hero section renders", async ({ page }) => {
    // Wait for skeleton/loading state to disappear
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 15000 });
    const text = await page.locator("h1").first().textContent();
    expect(text).toMatch(/Welcome|Dashboard/i);
  });
});
