# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: game.spec.ts >> Multiplication Speed Math Game >> should change language to Spanish
- Location: tests/game.spec.ts:15:3

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
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | test.describe('Multiplication Speed Math Game', () => {
  4   |   
  5   |   test.beforeEach(async ({ page }) => {
  6   |     // Note: The webserver is expected to be running at the baseURL
> 7   |     await page.goto('/');
      |                ^ Error: page.goto: NS_ERROR_CONNECTION_REFUSED
  8   |   });
  9   | 
  10  |   test('should show start screen initially', async ({ page }) => {
  11  |     await expect(page.locator('#start-screen')).toBeVisible();
  12  |     await expect(page.locator('h1')).toHaveText('Multiplication Speed Math');
  13  |   });
  14  | 
  15  |   test('should change language to Spanish', async ({ page }) => {
  16  |     await page.click('button[data-lang="es"]');
  17  |     await expect(page.locator('h1')).toHaveText('Matemáticas de Velocidad: Multiplicación');
  18  |     await expect(page.locator('#username-input')).toHaveAttribute('placeholder', 'Introduce tu nombre');
  19  |   });
  20  | 
  21  |   test('should require username to start', async ({ page }) => {
  22  |     const alertPromise = page.waitForEvent('dialog');
  23  |     await page.click('.mode-btn[data-mode="bullet"]');
  24  |     const dialog = await alertPromise;
  25  |     await expect(dialog.message()).toBe('¡Por favor, introduce tu nombre para empezar!');
  26  |   });
  27  | 
  28  |   test('should play a basic game loop', async ({ page }) => {
  29  |     // 1. Set up user
  30  |     await page.fill('#username-input', 'TestUser');
  31  |     
  32  |     // 2. Select mode and level (Level 1: 1-9)
  33  |     await page.click('.mode-btn[data-mode="bullet"]');
  34  |     // Level 1 is default, but let's be explicit
  35  |     await page.click('.level-btn[data-level="1"]');
  36  |     
  37  |     // Note: The mode selection click actually triggers startCountdown in main.js.
  38  |     // However, in the current main.js, clicking a mode button uses usernameInput.value
  39  |     // and starts countdown immediately. 
  40  |     // Wait, the user has to click mode button.
  41  |     
  42  |     // Let's re-verify workflow in main.js:
  43  |     // modeBtns.forEach(btn => {
  44  |     //   btn.addEventListener('click', () => {
  45  |     //     ...
  46  |     //     startCountdown();
  47  |     //   });
  48  |     // });
  49  |     
  50  |     // Since we clicked mode-btn, countdown should be visible.
  51  |     await expect(page.locator('#countdown-screen')).toBeVisible();
  52  |     
  53  |     // 3. Wait for countdown to end (it's 5s)
  54  |     await page.waitForTimeout(6000);
  55  |     
  56  |     // 4. Check game screen
  57  |     await expect(page.locator('#game-screen')).toBeVisible();
  58  |     await expect(page.locator('#question-display')).toBeVisible();
  59  |     
  60  |     // 5. Answer a question
  61  |     // We need to know what question was generated. Since it's random, 
  62  |     // we can use the dataset.answer attribute on the input.
  63  |     const answer = await page.getAttribute('#answer-input', 'data-answer');
  64  |     await page.fill('#answer-input', answer!);
  65  |     
  66  |     // Verify score updated
  67  |     await expect(page.locator('#score-display')).toContainText('Score: 1');
  68  |     
  69  |     // 6. End the game (hard to wait for timer in test, let's just check results after time)
  70  |     // For testing, we might want a shorter timer, but let's wait for bullet (30s)
  71  |     // or we can manually stop it if we had access. 
  72  |     // Alternatively, let's just test if the input works.
  73  |   });
  74  | 
  75  |   test('should use number keyboard', async ({ page }) => {
  76  |     await page.fill('#username-input', 'KeyboardUser');
  77  |     await page.click('.mode-btn[data-mode="bullet"]');
  78  |     await page.waitForTimeout(6000); // Countdown
  79  |     
  80  |     // Get expected answer
  81  |     const answer = await page.getAttribute('#answer-input', 'data-answer');
  82  |     
  83  |     // Use keyboard buttons
  84  |     for (const char of answer!.split('')) {
  85  |       await page.click(`.key[data-key="${char}"]`);
  86  |     }
  87  |     
  88  |     // If all keys clicked, it should have triggered 'input' event and moved to next question
  89  |     // The answer input should have been cleared
  90  |     await expect(page.locator('#answer-input')).toHaveValue('');
  91  |     await expect(page.locator('#score-display')).toContainText('Score: 1');
  92  |   });
  93  | 
  94  |   test('should show leaderboard', async ({ page }) => {
  95  |     await page.fill('#username-input', 'LeaderboardUser');
  96  |     await page.click('.mode-btn[data-mode="bullet"]');
  97  |     await page.waitForTimeout(6000); 
  98  |     
  99  |     // Finish game (wait for timer or just force end)
  100 |     // Instead of waiting 30s, let's just navigate to results if we could.
  101 |     // But we have to play. Let's just check if the button exists.
  102 |     await page.click('#leaderboard-btn');
  103 |     await expect(page.locator('#leaderboard-screen')).toBeVisible();
  104 |   });
  105 | });
  106 | 
```