import { test, expect } from "@playwright/test";
import { addApiMocks } from "./global-mock";

test.describe("Analytics Page — Reviews / Recommendations Tabs", () => {
  test.beforeEach(async ({ page }) => {
    await addApiMocks(page);
    await page.goto("/app/analytics", { waitUntil: "domcontentloaded" });
    // Wait for the page to render — h1 "Analytics" heading should be visible
    await expect(page.getByRole("heading", { name: "Analytics" })).toBeVisible({
      timeout: 20000,
    });
  });

  test("TabBar is visible with all 6 tabs", async ({ page }) => {
    // The TabBar is a segmented button group rendered as <button> elements
    const tabLabels = [
      "Overview",
      "Content",
      "Fulfillment",
      "Supply Chain",
      "Reviews",
      "Recommendations",
    ];

    for (const label of tabLabels) {
      const tab = page.getByRole("button", { name: label });
      await expect(tab).toBeVisible({ timeout: 10000 });
    }
  });

  test("click Reviews tab — shows content or empty state (no crash)", async ({ page }) => {
    // Click the Reviews tab button
    const reviewsTab = page.getByRole("button", { name: "Reviews" });
    await expect(reviewsTab).toBeVisible({ timeout: 10000 });
    await reviewsTab.click();

    // After clicking, the page should not crash — wait for any content to appear.
    // The mock data returns empty reviews, so we may see an empty state or KPI cards.
    // Acceptable outcomes:
    //   a) "No review invitations yet" empty state (most likely with mock data)
    //   b) "Review Invitations" heading with KPI cards
    //   c) Error state: "Unable to load review data"
    const emptyState = page.getByText("No review invitations yet");
    const heading = page.getByText("Review Invitations");
    const errorState = page.getByText("Unable to load review data");

    // Wait for at least one of the expected elements to become visible
    const hasEmpty = await emptyState.isVisible().catch(() => false);
    const hasHeading = await heading.isVisible().catch(() => false);
    const hasError = await errorState.isVisible().catch(() => false);

    // At least one of the three states must be visible — the page did not crash
    expect(hasEmpty || hasHeading || hasError).toBeTruthy();
  });

  test("click Recommendations tab — shows How It Works or Product Recommendations", async ({ page }) => {
    // Click the Recommendations tab button
    const recTab = page.getByRole("button", { name: "Recommendations" });
    await expect(recTab).toBeVisible({ timeout: 10000 });
    await recTab.click();

    // The Recommendations tab always shows either:
    //   a) "How It Works" heading (when data is loaded, even with zeros)
    //   b) "Product Recommendations" empty state (no data yet)
    //   c) "Recommendations Analytics" error state
    const howItWorks = page.getByText("How It Works");
    const productRecs = page.getByText("Product Recommendations");
    const errorState = page.getByText("Recommendations Analytics");

    // Wait a moment for lazy-loaded data
    await page.waitForTimeout(1000);

    const hasHow = await howItWorks.isVisible().catch(() => false);
    const hasRecs = await productRecs.isVisible().catch(() => false);
    const hasError = await errorState.isVisible().catch(() => false);

    // Verify at least one expected element is visible
    expect(hasHow || hasRecs || hasError).toBeTruthy();

    // If "How It Works" is visible, also check for the sub-content
    if (hasHow) {
      const fbt = page.getByText("Frequently Bought Together");
      const trending = page.getByText("Trending Now");
      const hasFbt = await fbt.isVisible().catch(() => false);
      const hasTrending = await trending.isVisible().catch(() => false);
      expect(hasFbt || hasTrending).toBeTruthy();
    }
  });

  test("switch tabs with 2-second delay — no crash", async ({ page }) => {
    // Navigate: Overview → Reviews → Recommendations with explicit waits

    // 1. Start on Overview (default)
    await expect(page.getByRole("button", { name: "Overview" })).toBeVisible({
      timeout: 10000,
    });

    // 2. Click Reviews tab
    const reviewsTab = page.getByRole("button", { name: "Reviews" });
    await reviewsTab.click();
    await page.waitForTimeout(2000);

    // Verify Reviews content loaded
    const reviewsContent = page.getByText(/No review invitations|Review Invitations|Unable to load review/);
    await expect(reviewsContent.first()).toBeVisible({ timeout: 10000 });

    // 3. Click Recommendations tab
    const recTab = page.getByRole("button", { name: "Recommendations" });
    await recTab.click();
    await page.waitForTimeout(2000);

    // Verify Recommendations content loaded
    const recContent = page.getByText(/How It Works|Product Recommendations|Recommendations Analytics/);
    await expect(recContent.first()).toBeVisible({ timeout: 10000 });

    // 4. Switch back to Reviews
    await reviewsTab.click();
    await page.waitForTimeout(2000);

    // Should still show Reviews content
    await expect(reviewsContent.first()).toBeVisible({ timeout: 10000 });
  });
});
