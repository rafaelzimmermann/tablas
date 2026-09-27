# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: highlighting.spec.ts >> Language Selection Highlighting >> should highlight English by default
- Location: tests/highlighting.spec.ts:9:3

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:3001/
Call log:
  - navigating to "http://127.0.0.1:3001/", waiting until "load"

```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Language Selection Highlighting', () => {
  4  |   
  5  |   test.beforeEach(async ({ page }) => {
> 6  |     await page.goto('/');
     |                ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:3001/
  7  |   });
  8  | 
  9  |   test('should highlight English by default', async ({ page }) => {
  10 |     const enBtn = page.locator('button[data-lang="en"]');
  11 |     await expect(enBtn).toHaveClass(/active/);
  12 |   });
  13 | 
  14 |   test('should highlight Spanish when selected', async ({ page }) => {
  15 |     const enBtn = page.locator('button[data-lang="en"]');
  16 |     const esBtn = page.locator('button[data-lang="es"]');
  17 | 
  18 |     await expect(enBtn).toHaveClass(/active/);
  19 |     await expect(esBtn).not.toHaveClass(/active/);
  20 | 
  21 |     await esBtn.click();
  22 | 
  23 |     await expect(esBtn).toHaveClass(/active/);
  24 |     await expect(enBtn).not.toHaveClass(/active/);
  25 |   });
  26 | });
  27 | 
```