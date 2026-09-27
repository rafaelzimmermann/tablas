import { test, expect } from '@playwright/test';

test.describe('Math Speed Games', () => {
  
  test.beforeEach(async ({ page }) => {
    // Note: The webserver is expected to be running at the baseURL
    await page.goto('/');
  });

  test('should show start screen initially', async ({ page }) => {
    await expect(page.locator('#start-screen')).toBeVisible();
    await expect(page.locator('#start-screen h1')).toHaveText('Math Speed Games');
  });

  test('should change language to Spanish', async ({ page }) => {
    await page.click('button[data-lang="es"]');
    await expect(page.locator('#start-screen h1')).toHaveText('Matemáticas de Velocidad');
    await expect(page.locator('#username-input')).toHaveAttribute('placeholder', 'Introduce tu nombre');
  });

  test('should require username to continue', async ({ page }) => {
    let dialogMessage = '';
    page.on('dialog', dialog => {
      dialogMessage = dialog.message();
      dialog.accept();
    });

    await expect(page.locator('#start-screen')).toBeVisible();

    // Enable the button even though username is empty
    await page.evaluate(() => {
      const btn = document.querySelector('#continue-btn');
      if (btn) btn.disabled = false;
    });
    
    // Trigger click via evaluate to avoid Playwright's click-related timeouts
    await page.evaluate(() => {
      const btn = document.querySelector('#continue-btn');
      if (btn) btn.click();
    });
    
    // Wait for the message to be populated
    await expect.poll(() => dialogMessage, { timeout: 5000 }).toBe('Please enter your name to start playing!');
  });

  test('should play a basic game loop', async ({ page }) => {
    // 1. Set up user
    await page.fill('#username-input', 'TestUser');
    await page.waitForTimeout(100); // Wait for button to enable
    await page.click('#continue-btn');
    
    // 2. Select game
    await expect(page.locator('#game-selection-screen')).toBeVisible();
    await page.click('.game-btn[data-game="multiplication"]');
    
    // 3. Select mode and level
    await expect(page.locator('#mode-level-screen')).toBeVisible();
    await page.click('.mode-btn[data-mode="bullet"]');
    await page.click('.level-btn[data-level="1"]');
    await page.click('#start-game-btn');
    
    // 4. Wait for countdown to end (5s)
    await expect(page.locator('#countdown-screen')).toBeVisible();
    await page.waitForTimeout(6000);
    
    // 5. Check game screen
    await expect(page.locator('#game-screen')).toBeVisible();
    await expect(page.locator('#question-display')).toBeVisible();
    
    // 6. Answer a question
    const answer = await page.getAttribute('#answer-input', 'data-answer');
    await page.fill('#answer-input', answer!);
    
    // Verify score updated
    await expect(page.locator('#score-display')).toContainText('Score: 1');
  });

  test('should use number keyboard', async ({ page }) => {
    await page.fill('#username-input', 'KeyboardUser');
    await page.waitForTimeout(100); // Wait for button to enable
    await page.click('#continue-btn');
    await page.click('.game-btn[data-game="multiplication"]');
    await page.click('.mode-btn[data-mode="bullet"]');
    await page.click('.level-btn[data-level="1"]');
    await page.click('#start-game-btn');
    
    await page.waitForTimeout(6000); // Countdown
    
    const answer = await page.getAttribute('#answer-input', 'data-answer');
    
    // Use keyboard buttons
    for (const char of answer!.split('')) {
      await page.click(`.key[data-key="${char}"]`);
    }
    
    // If all keys clicked, it should have triggered 'input' event and moved to next question
    await expect(page.locator('#answer-input')).toHaveValue('');
    await expect(page.locator('#score-display')).toContainText('Score: 1');
  });

  test('should show leaderboard', async ({ page }) => {
    // On start screen
    await expect(page.locator('#start-screen')).toBeVisible();
    await page.click('#view-leaderboard-btn');
    await expect(page.locator('#leaderboard-screen')).toBeVisible();
  });
});
