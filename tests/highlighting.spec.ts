import { test, expect } from '@playwright/test';

test.describe('Language Selection Highlighting', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should highlight English by default', async ({ page }) => {
    const enBtn = page.locator('button[data-lang="en"]');
    await expect(enBtn).toHaveClass(/active/);
  });

  test('should highlight Spanish when selected', async ({ page }) => {
    const enBtn = page.locator('button[data-lang="en"]');
    const esBtn = page.locator('button[data-lang="es"]');

    await expect(enBtn).toHaveClass(/active/);
    await expect(esBtn).not.toHaveClass(/active/);

    await esBtn.click();

    await expect(esBtn).toHaveClass(/active/);
    await expect(enBtn).not.toHaveClass(/active/);
  });
});
