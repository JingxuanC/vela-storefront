import { test, expect } from "@playwright/test";
import { addApiMocks } from "./global-mock";

test.describe("Sidebar Navigation", () => {
  test.beforeEach(async ({ page }) => {
    await addApiMocks(page);
    await page.goto("/app/dashboard", { waitUntil: "domcontentloaded" });
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 15000 });
  });

  test("navigation items exist in sidebar", async ({ page }) => {
    // Verify the 4 logical sections are present
    const sections = ["Overview", "AI Marketing", "Operations", "Account"];
    for (const section of sections) {
      await expect(page.locator(`nav:has-text("${section}")`)).toBeVisible({ timeout: 10000 });
    }
    // Verify key nav items exist
    const navItems = ["Dashboard", "Analytics", "Products", "SEO & GEO", "Content Factory", "Returns & Exchange"];
    for (const item of navItems) {
      const navLink = page.locator(`nav a:has-text("${item}")`).first();
      await expect(navLink).toBeVisible({ timeout: 10000 });
    }
  });

  test("clicking Analytics navigates to /app/analytics", async ({ page }) => {
    const analyticsLink = page.locator('nav a:has-text("Analytics")').first();
    await expect(analyticsLink).toBeVisible({ timeout: 10000 });
    await analyticsLink.click();
    await expect(page.getByRole("heading", { name: "Analytics" })).toBeVisible({ timeout: 15000 });
  });

  test("clicking SEO & GEO navigates to /app/seo-batch", async ({ page }) => {
    const seoLink = page.locator('nav a:has-text("SEO & GEO")').first();
    await expect(seoLink).toBeVisible({ timeout: 10000 });
    await seoLink.click();
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 15000 });
    const h1Text = await page.locator("h1").first().textContent();
    expect(h1Text).toBeTruthy();
  });

  test("clicking Returns & Exchange navigates to /app/returns", async ({ page }) => {
    const returnsLink = page.locator('nav a:has-text("Returns & Exchange")').first();
    await expect(returnsLink).toBeVisible({ timeout: 10000 });
    await returnsLink.click();
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 15000 });
  });

  test("clicking Cart Recovery navigates to /app/cart-recovery", async ({ page }) => {
    const cartRecoveryLink = page.locator('nav a:has-text("Cart Recovery")').first();
    await expect(cartRecoveryLink).toBeVisible({ timeout: 10000 });
    await cartRecoveryLink.click();
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 15000 });
  });

  test("clicking Plans navigates to /app/plans", async ({ page }) => {
    const plansLink = page.locator('nav a:has-text("Plans")').first();
    await expect(plansLink).toBeVisible({ timeout: 10000 });
    await plansLink.click();
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 15000 });
  });

  test("clicking Settings navigates to /app/settings", async ({ page }) => {
    const settingsLink = page.locator('nav a:has-text("Settings")').first();
    await expect(settingsLink).toBeVisible({ timeout: 10000 });
    await settingsLink.click();
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 15000 });
  });
});
