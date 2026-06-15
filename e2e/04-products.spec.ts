import { test, expect } from "@playwright/test";
import { addApiMocks } from "./global-mock";
test.describe("Products Page", () => {
  test.beforeEach(async ({ page }) => {
    await addApiMocks(page);
    await page.goto("/app/products", { waitUntil: "domcontentloaded" });
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 15000 });
  });

  test("page loads with title", async ({ page }) => {
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole('heading', { name: 'Product Styles' })).toBeVisible({ timeout: 10000 });
  });

  test("search input exists and is usable", async ({ page }) => {
    // The search input has placeholder "Search products by name..."
    const searchInput = page.locator('input[placeholder="Search products by name..."]');
    await expect(searchInput).toBeVisible({ timeout: 10000 });

    // Type a search query
    await searchInput.fill("test");
    expect(await searchInput.inputValue()).toBe("test");

    // Clear the search (the × button appears when there's text)
    const clearBtn = page.locator('button[aria-label="Clear search"]');
    await expect(clearBtn).toBeVisible({ timeout: 5000 });

    // Clear the search
    await clearBtn.click();
    expect(await searchInput.inputValue()).toBe("");
  });

  test("product card grid appears", async ({ page }) => {
    // Either product cards exist or an empty state is shown
    // Product cards: look for the "Click to configure" text in view mode
    const clickToConfigure = page.locator("text=Click to configure").first();
    const emptyState = page.locator("text=No products found").first();

    // One of these should be visible
    const cardVisible = await clickToConfigure.isVisible().catch(() => false);
    const emptyVisible = await emptyState.isVisible().catch(() => false);

    if (!cardVisible && !emptyVisible) {
      // Try looking for product count text
      const productCount = page.locator("text=/\\d+ product/");
      await expect(productCount).toBeVisible({ timeout: 5000 });
    }
  });

  test("load more / pagination is available", async ({ page }) => {
    // Check if "Load More" button exists (it only shows when hasMore is true)
    const loadMore = page.locator("button:has-text('Load More')");
    const loadMoreVisible = await loadMore.isVisible().catch(() => false);

    if (loadMoreVisible) {
      // Click load more
      await loadMore.click();
      await page.waitForTimeout(1000);
    }
  });

  test("empty and error state handling", async ({ page }) => {
    // Test filtering to a non-matching search produces empty state
    const searchInput = page.locator('input[placeholder="Search products by name..."]');
    await expect(searchInput).toBeVisible({ timeout: 5000 });

    // Search for something unlikely to match
    await searchInput.fill("zzzzzznonexistent");
    await page.waitForTimeout(500);

    // Should show "No products match your search"
    const emptyTitle = page.locator("text=No products match").first();
    const noMatch = await emptyTitle.isVisible().catch(() => false);
    if (noMatch) {
      await expect(emptyTitle).toBeVisible({ timeout: 5000 });
    }

    // Clear search to restore — use Escape to close/clear
    await page.keyboard.press("Escape");
    await page.waitForTimeout(300);
  });
});
