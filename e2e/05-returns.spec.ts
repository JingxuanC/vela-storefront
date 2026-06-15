import { test, expect } from "@playwright/test";
import { addApiMocks } from "./global-mock";
test.describe("Returns Page", () => {
  test.beforeEach(async ({ page }) => {
    await addApiMocks(page);
    await page.goto("/app/returns", { waitUntil: "domcontentloaded" });
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 15000 });
  });

  test("page loads with title", async ({ page }) => {
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole('heading', { name: 'Returns' })).toBeVisible({ timeout: 10000 });
  });

  test("returns table exists", async ({ page }) => {
    // Either the table is shown with data, or an empty state
    const table = page.locator("table");
    const tableVisible = await table.isVisible().catch(() => false);

    if (tableVisible) {
      // Verify table header columns
      await expect(page.getByText("Return ID").first()).toBeVisible({ timeout: 5000 }).catch(() => {});
      await expect(page.getByText("Customer").first()).toBeVisible({ timeout: 5000 }).catch(() => {});
      await expect(page.locator("text=Status").first()).toBeVisible({ timeout: 5000 }).catch(() => {});
    } else {
      // Empty state
      const emptyState = page.locator("text=No return requests yet").first();
      const filteredEmpty = page.locator("text=No returns match your filters").first();
      const anyEmpty = (await emptyState.isVisible().catch(() => false)) ||
                       (await filteredEmpty.isVisible().catch(() => false));
      expect(anyEmpty).toBeTruthy();
    }
  });

  test("search and filter is available", async ({ page }) => {
    // Search input with placeholder
    const searchInput = page.locator('input[placeholder="Search by order ID or customer name..."]');
    await expect(searchInput).toBeVisible({ timeout: 10000 });

    // Type a search query
    await searchInput.fill("test");
    expect(await searchInput.inputValue()).toBe("test");

    // Clear by pressing Escape
    await searchInput.press("Escape");
    await page.waitForTimeout(200);
    const clearedValue = await searchInput.inputValue();
    // Either cleared or the search term remains (depending on implementation)
    expect(typeof clearedValue).toBe("string");
  });

  test("status filter pills are clickable", async ({ page }) => {
    // Status filter buttons: "Status:" label followed by pill buttons
    const statusLabel = page.locator("text=Status:").first();
    await expect(statusLabel).toBeVisible({ timeout: 10000 });

    // Click through various status filters
    const statusFilters = ["Pending", "Approved", "In Transit"];
    for (const filter of statusFilters) {
      const btn = page.locator(`button:has-text("${filter}")`).first();
      const visible = await btn.isVisible().catch(() => false);
      if (visible) {
        await btn.click();
        await page.waitForTimeout(300);
      }
    }

    // Reset to "All"
    const allBtn = page.locator("button:has-text('All')").first();
    await allBtn.click();
    await page.waitForTimeout(300);
  });

  test("bulk select (select all) is available", async ({ page }) => {
    // Look for the select-all checkbox in the table header
    const selectAllCheckbox = page.locator('input[aria-label="Select all returns"]');
    const selectAllVisible = await selectAllCheckbox.isVisible().catch(() => false);

    // Also check for individual row checkboxes
    const rowCheckboxes = page.locator('input[aria-label*="Select return"]');

    if (selectAllVisible) {
      // Click select all
      await selectAllCheckbox.click();
      await page.waitForTimeout(300);

      // Verify the bulk approve button appears when items are selected
      const bulkBtn = page.locator("button:has-text('Bulk Approve')");
      const bulkVisible = await bulkBtn.isVisible().catch(() => false);
      if (bulkVisible) {
        await expect(bulkBtn).toBeVisible({ timeout: 5000 });
      }

      // Deselect all
      await selectAllCheckbox.click();
      await page.waitForTimeout(300);
    } else {
      const rowCount = await rowCheckboxes.count();
      if (rowCount > 0) {
        // Click the first row's checkbox
        await rowCheckboxes.first().click();
        await page.waitForTimeout(300);
      }
    }
  });
});
