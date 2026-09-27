import { test, expect } from "@playwright/test";

test("language and selections stay visible and survive replay", async ({
  page,
}) => {
  await page.clock.install();
  await page.goto("/");
  await expect(page.locator('[data-lang="en"]')).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await page.locator('[data-lang="es"]').click();
  await expect(page.locator("html")).toHaveAttribute("lang", "es");
  await expect(page.locator('[data-lang="es"]')).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(page.locator('[data-lang="en"]')).toHaveAttribute(
    "aria-pressed",
    "false",
  );
  await expect(page.locator("h1")).toHaveText("Vamos a jugar con los números.");
  await page.locator("#username-input").fill("Lucía");
  await page.locator('[data-value="sum"]').click();
  await expect(page.locator('[data-value="sum"]')).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await page.locator('[data-value="bullet"]').click();
  await page.locator("#start-game-btn").click();
  await page.clock.fastForward(3000);
  await expect(page.locator(".check")).toContainText("Comprobar respuesta");
  await page.locator(".check").click();
  await expect(page.locator("#feedback")).toHaveText(
    "Primero escribe tu respuesta.",
  );
  await page.clock.fastForward(30000);
  await expect(page.locator("h1")).toHaveText("¡Buen trabajo, Lucía!");
  await page.locator("#restart-btn").click();
  await page.clock.fastForward(3000);
  await expect(page.locator("html")).toHaveAttribute("lang", "es");
  await expect(page.locator("h1")).toHaveText("Sumar");
});
