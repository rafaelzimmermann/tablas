import { test, expect } from "@playwright/test";
import { mkdir } from "node:fs/promises";

for (const width of [320, 390, 1440]) {
  test(`full flow fits ${width}px in both languages`, async ({
    page,
  }, testInfo) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.clock.install();
    await page.setViewportSize({ width, height: width === 1440 ? 1050 : 844 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    const capture = async (name: string) => {
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        name,
      ).toBe(true);
      if (process.env.TABLAS_CAPTURE && testInfo.project.name === "chromium") {
        await mkdir("docs/verification/production", { recursive: true });
        await page.screenshot({
          path: `docs/verification/production/${name}-${width}.png`,
          fullPage: true,
        });
      }
    };
    for (const language of ["en", "es"]) {
      await page.goto("/");
      await page.locator(`[data-lang="${language}"]`).click();
      await page.locator("#username-input").fill("Alex");
      await capture(`home-${language}`);
      await page.locator('[data-value="division"]').click();
      await page.locator('[data-group="level"][data-value="3"]').click();
      await page.locator('[data-value="bullet"]').click();
      await page.locator("#start-game-btn").click();
      await page.clock.fastForward(3000);
      await capture(`game-${language}`);
      await page.locator("#answer-input").fill("99999999");
      await page.locator(".check").click();
      await capture(`feedback-${language}`);
      await page.locator('[data-action="pause"]').click();
      await expect(page.locator("#pause-dialog")).toBeVisible();
      await capture(`pause-${language}`);
      await page.locator('[data-action="resume"]').click();
      await page.clock.fastForward(30000);
      await capture(`results-${language}`);
      await page.locator('[data-action="progress"]').click();
      await capture(`progress-${language}`);
    }
    expect(errors).toEqual([]);
  });
}
