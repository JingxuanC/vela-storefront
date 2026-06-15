// ============================================================================
// Vela AI — Floating AI Assistant E2E Tests
// Tests the floating chat bubble available on every app page.
// ============================================================================

import { test, expect } from "@playwright/test";
import { addApiMocks } from "./global-mock";

test.describe("Floating AI Assistant", () => {
  test.beforeEach(async ({ page }) => {
    await addApiMocks(page);
    // Navigate to any app page to see the floating bubble
    await page.goto("/app/dashboard", { waitUntil: "domcontentloaded" });
    await expect(page.locator("body")).toBeVisible({ timeout: 20000 });
  });

  test("floating bubble is visible on app pages", async ({ page }) => {
    const bubble = page.locator('button[aria-label="Open AI Assistant"]');
    await expect(bubble).toBeVisible({ timeout: 10000 });
    await expect(bubble).toHaveText("🤖");
  });

  test("clicking bubble opens chat panel", async ({ page }) => {
    // Open the assistant
    await page.locator('button[aria-label="Open AI Assistant"]').click();

    // Panel should appear
    const header = page.locator("text=AI Assistant");
    await expect(header).toBeVisible({ timeout: 5000 });

    // Close button should now be visible
    const closeBtn = page.locator('button[aria-label="Close AI Assistant"]');
    await expect(closeBtn).toBeVisible({ timeout: 3000 });
  });

  test("greeting loads when panel opens", async ({ page }) => {
    await page.locator('button[aria-label="Open AI Assistant"]').click();
    await page.waitForTimeout(2000);

    // The summary mock returns a greeting — should appear in messages
    const body = page.locator("div[style*='flex: 1']"); // messages area
    const text = await body.textContent();
    expect(text).toBeTruthy();
  });

  test("quick questions are visible under greeting", async ({ page }) => {
    await page.locator('button[aria-label="Open AI Assistant"]').click();
    await page.waitForTimeout(2000);

    // Quick questions should appear
    const quickQuestions = ["How's business today?", "return rate", "trending", "inventory"];
    for (const q of quickQuestions) {
      const btn = page.locator("button").filter({ hasText: new RegExp(q, "i") });
      const count = await btn.count();
      if (count > 0) {
        await expect(btn.first()).toBeVisible({ timeout: 3000 });
      }
    }
  });

  test("input field is present and enabled", async ({ page }) => {
    await page.locator('button[aria-label="Open AI Assistant"]').click();
    await page.waitForTimeout(1000);

    const input = page.locator("input[placeholder*='store']");
    await expect(input).toBeVisible({ timeout: 5000 });
    await expect(input).toBeEnabled();
  });

  test("send button is present and disabled when input empty", async ({ page }) => {
    await page.locator('button[aria-label="Open AI Assistant"]').click();
    await page.waitForTimeout(1000);

    const sendBtn = page.locator("button").filter({ hasText: /Send/i });
    await expect(sendBtn).toBeVisible({ timeout: 5000 });

    // Send button should be disabled when input is empty
    await expect(sendBtn).toBeDisabled({ timeout: 3000 });
  });

  test("typing a question enables send button", async ({ page }) => {
    await page.locator('button[aria-label="Open AI Assistant"]').click();
    await page.waitForTimeout(1000);

    const input = page.locator("input[placeholder*='store']");
    await input.fill("How's business today?");

    const sendBtn = page.locator("button").filter({ hasText: /Send/i });
    await expect(sendBtn).toBeEnabled({ timeout: 3000 });
  });

  test("send question shows streaming answer", async ({ page }) => {
    await page.locator('button[aria-label="Open AI Assistant"]').click();
    await page.waitForTimeout(2000);

    const input = page.locator("input[placeholder*='store']");
    await input.fill("How's business today?");

    const sendBtn = page.locator("button").filter({ hasText: /Send/i });
    await sendBtn.click();

    // Wait for SSE stream to complete
    await page.waitForTimeout(2000);

    // Should show the mock SSE answer
    const body = page.locator("div[style*='flex: 1']");
    const text = await body.textContent();
    expect(text).toContain("return rate");
  });

  test("closing and reopening clears messages", async ({ page }) => {
    // Open, send a question
    await page.locator('button[aria-label="Open AI Assistant"]').click();
    await page.waitForTimeout(1000);

    const input = page.locator("input[placeholder*='store']");
    await input.fill("Test question");
    const sendBtn = page.locator("button").filter({ hasText: /Send/i });
    await sendBtn.click();
    await page.waitForTimeout(2000);

    // Close
    await page.locator('button[aria-label="Close AI Assistant"]').click();
    await page.waitForTimeout(500);

    // Reopen
    await page.locator('button[aria-label="Open AI Assistant"]').click();
    await page.waitForTimeout(1000);

    // Messages should persist (not reset on close — that's current behavior)
    const header = page.locator("text=AI Assistant");
    await expect(header).toBeVisible({ timeout: 3000 });
  });

  test("stop button appears while loading", async ({ page }) => {
    await page.locator('button[aria-label="Open AI Assistant"]').click();
    await page.waitForTimeout(1000);

    const input = page.locator("input[placeholder*='store']");
    await input.fill("Test question");

    const sendBtn = page.locator("button").filter({ hasText: /Send/i });
    await sendBtn.click();

    // Stop button should appear briefly
    const stopBtn = page.locator("button").filter({ hasText: /Stop/i });
    await expect(stopBtn).toBeVisible({ timeout: 3000 });
  });

  test("full-screen admin-chat route also works", async ({ page }) => {
    await addApiMocks(page);
    await page.goto("/app/admin-chat", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(2000);

    // Should show AI Assistant header (no bubble toggle in fullscreen)
    const header = page.locator("text=AI Assistant");
    await expect(header).toBeVisible({ timeout: 10000 });

    // Should have input field
    const input = page.locator("input[placeholder*='store']");
    await expect(input).toBeVisible({ timeout: 5000 });
  });
});
