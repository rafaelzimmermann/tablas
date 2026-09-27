# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: highlighting.spec.ts >> Language Selection Highlighting >> should highlight Spanish when selected
- Location: tests/highlighting.spec.ts:14:3

# Error details

```
Error: page.goto: NS_ERROR_CONNECTION_REFUSED
Call log:
  - navigating to "http://127.0.0.1:3001/", waiting until "load"

```

# Page snapshot

```yaml
- article [ref=e3]:
  - generic [ref=e6]:
    - heading "Unable to connect" [level=1] [ref=e7]
    - paragraph [ref=e8]:
      - text: Nightly can’t connect to the server at
      - strong [ref=e9]: 127.0.0.1:3001
    - generic [ref=e10]:
      - heading "What can you do about it?" [level=3] [ref=e11]
      - list [ref=e12]:
        - listitem [ref=e13]: The site could be temporarily unavailable or too busy. Try again in a few moments.
        - listitem [ref=e14]: If you are unable to load any pages, check your computer’s network connection.
        - listitem [ref=e15]: If your computer or network is protected by a firewall or proxy, make sure that Nightly is permitted to access the web.
    - button "Try Again" [ref=e18]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Language Selection Highlighting', () => {
  4  |   
  5  |   test.beforeEach(async ({ page }) => {
> 6  |     await page.goto('/');
     |                ^ Error: page.goto: NS_ERROR_CONNECTION_REFUSED
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