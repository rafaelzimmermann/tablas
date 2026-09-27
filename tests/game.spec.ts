import { test, expect, Page } from "@playwright/test";

async function start(page: Page, name = "") {
  await page.clock.install();
  await page.goto("/");
  if (name) await page.locator("#username-input").fill(name);
  await page.locator('[data-group="mode"][data-value="bullet"]').click();
  await page.locator("#start-game-btn").click();
  await expect(page.locator("#countdown-screen")).toBeVisible();
  await page.clock.fastForward(3000);
  await expect(page.locator("#game-screen")).toBeVisible();
}
async function answer(page: Page) {
  const operands = await page
    .locator("#question-display .operand")
    .allTextContents();
  const a = Number(operands[0].replace(/\D/g, "")),
    b = Number(operands[1].replace(/\D/g, ""));
  const symbol = await page
    .locator("#question-display .operator")
    .textContent();
  return String(
    symbol === "×"
      ? a * b
      : symbol === "+"
        ? a + b
        : symbol === "−"
          ? a - b
          : a / b,
  );
}

test("one setup screen has useful selected defaults and allows a guest", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator('[data-value="multiplication"]')).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(page.locator('[data-value="blitz"]')).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(page.locator('[data-value="1"]')).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await page.locator("#start-game-btn").click();
  await expect(page.locator("#countdown-screen")).toBeVisible();
});

test("typing and editing do not submit; wrong submissions retain input and record once", async ({
  page,
}) => {
  await start(page, "Alex");
  const correct = await answer(page);
  await page.locator("#answer-input").fill("999999");
  await expect(page.locator("#score-display")).toHaveText("0");
  expect(
    await page.evaluate(() => localStorage.getItem("math_game_learning_data")),
  ).toBeNull();
  await page.locator(".check").click();
  await expect(page.locator("#answer-input")).toHaveValue("999999");
  await expect(page.locator("#feedback")).toContainText("Not quite");
  await page.locator(".check").click();
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("math_game_learning_data")!).Alex
          .multiplication.length,
    ),
  ).toBe(1);
  await page.locator("#answer-input").fill(correct);
  await page.locator("#answer-input").press("Enter");
  await expect(page.locator("#score-display")).toHaveText("1");
  await expect(page.locator("#answer-input")).toHaveValue("");
});

test("keypad submits only with Check, then results save once and replay preserves settings", async ({
  page,
}) => {
  await start(page, "Alex");
  for (const digit of await answer(page))
    await page.locator(`[data-key="${digit}"]`).click();
  await expect(page.locator("#score-display")).toHaveText("0");
  await page.locator(".check").click();
  await expect(page.locator("#score-display")).toHaveText("1");
  await page.clock.fastForward(30000);
  await expect(page.locator("#final-score")).toHaveText("1");
  const saved = await page.evaluate(() => ({
    scores: JSON.parse(localStorage.getItem("math_game_leaderboard")!),
    users: JSON.parse(localStorage.getItem("math_game_users")!),
  }));
  expect(saved.scores).toHaveLength(1);
  expect(saved.scores[0].compositeKey).toBe("multiplication_bullet_1");
  expect(saved.users.Alex.totalGames).toBe(1);
  await page.clock.fastForward(10000);
  await page.locator('[data-action="replay"]').click();
  await page.clock.fastForward(3000);
  await expect(page.locator("#score-display")).toHaveText("0");
  await expect(page.locator("#timer-display")).toHaveText("30");
  await page.locator('[data-action="pause"]').click();
  await page.locator('[data-action="end"]').click();
  await expect(page.locator("#results-screen")).toContainText(
    "ROUND ENDED EARLY",
  );
  expect(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("math_game_leaderboard")!).length,
    ),
  ).toBe(1);
  await page.locator('[data-action="home"]').click();
  await expect(page.locator("#username-input")).toHaveValue("Alex");
  await expect(page.locator('[data-value="bullet"]')).toHaveAttribute(
    "aria-pressed",
    "true",
  );
});

test("pause hides the question, freezes time, traps focus and Escape resumes", async ({
  page,
}) => {
  await start(page);
  await page.clock.fastForward(5000);
  const left = await page.locator("#timer-display").textContent();
  await page.locator('[data-action="pause"]').click();
  await expect(page.locator("#pause-dialog")).toBeVisible();
  await expect(page.locator("#question-display")).toBeHidden();
  await expect(page.locator("nav")).toBeHidden();
  await page.clock.fastForward(10000);
  await expect(page.locator("#timer-display")).toHaveText(left!);
  await page.keyboard.press("Tab");
  expect(
    await page.evaluate(
      () => document.activeElement?.closest("dialog") !== null,
    ),
  ).toBe(true);
  await page.keyboard.press("Escape");
  await expect(page.locator("#question-display")).toBeVisible();
  await expect(page.locator("#answer-input")).toBeFocused();
  await page.clock.fastForward(1000);
  await expect(page.locator("#timer-display")).toHaveText(
    String(Number(left) - 1),
  );
});

test("browser Back pauses active play rather than losing the round", async ({
  page,
}) => {
  await start(page);
  await page.goBack();
  await expect(page.locator("#pause-dialog")).toBeVisible();
  await expect(page).toHaveURL(/#round$/);
  await page.locator('[data-action="resume"]').click();
  await expect(page.locator("#game-screen")).toBeVisible();
});

test("guest completion does not save identity or scores", async ({ page }) => {
  await start(page);
  await page.clock.fastForward(30000);
  await expect(page.locator("#results-screen")).toContainText(
    "Playing as a guest",
  );
  expect(await page.evaluate(() => localStorage.length)).toBe(0);
});

test("all operations complete valid submissions at each range", async ({
  page,
}) => {
  await page.clock.install();
  for (const operation of [
    "multiplication",
    "sum",
    "subtraction",
    "division",
  ]) {
    for (const level of ["1", "2", "3"]) {
      await page.goto("/");
      await page.locator(`[data-value="${operation}"]`).click();
      await page.locator(`[data-group="level"][data-value="${level}"]`).click();
      await page.locator("#start-game-btn").click();
      await page.clock.fastForward(3000);
      await page.locator("#answer-input").fill(await answer(page));
      await page.locator(".check").click();
      await expect(page.locator("#score-display")).toHaveText("1");
      await page.locator('[data-action="pause"]').click();
      await page.locator('[data-action="end"]').click();
    }
  }
});

test("progress filters have honest empty states, safe names and restorable categories", async ({
  page,
}) => {
  await page.goto("/");
  await page.evaluate(() =>
    localStorage.setItem(
      "math_game_leaderboard",
      JSON.stringify([
        {
          username: "<img src=x onerror=alert(1)>",
          score: 12,
          compositeKey: "multiplication_blitz_1",
          timestamp: 1,
        },
      ]),
    ),
  );
  await page.getByRole("link", { name: "My progress", exact: true }).click();
  await expect(page.locator("tbody")).toContainText(
    "<img src=x onerror=alert(1)>",
  );
  await expect(page.locator("tbody img")).toHaveCount(0);
  await page.locator('[data-value="sum"]').click();
  await expect(page.locator("#leaderboard-screen")).toContainText(
    "No scores for these settings yet",
  );
  await page.reload();
  await expect(page.locator('[data-value="sum"]')).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(page.locator("#leaderboard-screen")).toBeVisible();
});

test("blocked storage still allows completion with an honest recovery message", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => {
      throw new Error("blocked");
    };
    Storage.prototype.setItem = () => {
      throw new Error("blocked");
    };
  });
  await start(page, "Alex");
  await expect(page.locator("#storage-status")).toBeVisible();
  await page.clock.fastForward(30000);
  await expect(page.locator("#results-screen")).toBeVisible();
  await expect(page.locator("#results-screen")).toContainText("can’t be saved");
});

test("English and Spanish layouts fit narrow screens and show the focused answer", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto("/");
  for (const lang of ["en", "es"]) {
    await page.locator(`[data-lang="${lang}"]`).click();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    await page
      .getByRole("link", {
        name: lang === "es" ? "Mi progreso" : "My progress",
        exact: true,
      })
      .click();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    await page.locator('nav a[href="#home"]').click();
  }
});
