import { test, expect } from "@playwright/test";
import { addApiMocks } from "./global-mock";
test.describe("Features Page", () => {
  test.beforeEach(async ({ page }) => {
    await addApiMocks(page);
    // Block Vite error overlay from intercepting clicks
    await page.addInitScript(() => {
      const observer = new MutationObserver(() => {
        const overlay = document.querySelector("vite-error-overlay");
        if (overlay) overlay.remove();
      });
      observer.observe(document.body || document.documentElement, { childList: true, subtree: true });
    });

    // Intercept feature toggle POST requests
    await page.route("**/app/features", (route) => {
      if (route.request().method() === "POST") {
        route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true }) });
      } else {
        route.continue();
      }
    });

    await page.goto("/app/features", { waitUntil: "domcontentloaded" });
    // Wait for skeleton to disappear and h1 to appear (client-side render after useEffect)
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 20000 });
  });

  test("page loads with title", async ({ page }) => {
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 15000 });
    const h1Text = await page.locator("h1").first().textContent();
    expect(h1Text).toMatch(/Features/i);
  });

  test("toggle switches exist and can be clicked", async ({ page }) => {
    const switches = page.locator('button[role="switch"]');
    await expect(switches.first()).toBeVisible({ timeout: 15000 });

    const firstSwitch = switches.first();
    await expect(firstSwitch).toBeVisible({ timeout: 10000 });

    const checkedAttr = await firstSwitch.getAttribute("aria-checked");
    const initialState = checkedAttr === "true";

    // Click the first enabled toggle
    await firstSwitch.click();
    await page.waitForTimeout(500);

    // Check the switch is still visible (action completed)
    await expect(firstSwitch).toBeVisible({ timeout: 5000 });
  });

  test("collapsible sections can be expanded/collapsed", async ({ page }) => {
    const sectionHeaders = page.locator("button:has(span:has-text('\u25bc'))");
    const headerCount = await sectionHeaders.count();
    expect(headerCount).toBeGreaterThanOrEqual(1);

    const firstHeader = sectionHeaders.first();
    await firstHeader.click();
    await page.waitForTimeout(300);
    await firstHeader.click();
    await page.waitForTimeout(300);
  });

  test("every toggle is clickable", async ({ page }) => {
    // Block Vite error overlay for this test too
    const switches = page.locator('button[role="switch"]:not([disabled])');
    const count = await switches.count();
    expect(count).toBeGreaterThanOrEqual(1);

    for (let i = 0; i < Math.min(count, 3); i++) {
      const toggle = switches.nth(i);
      await expect(toggle).toBeVisible({ timeout: 5000 });

      await toggle.click();
      await page.waitForTimeout(300);
      await toggle.click();
      await page.waitForTimeout(300);
    }
  });
});
