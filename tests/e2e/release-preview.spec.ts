import { test } from "@playwright/test";

const output = "reports/release-preview";

test("capture release preview screenshots", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/osanpo/plan/");
  await page.screenshot({ path: `${output}/plan-start-desktop.png`, fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: `${output}/plan-start-mobile.png`, fullPage: true });

  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: width === 1440 ? 1000 : 844 });
    await page.goto("/osanpo/plan/?duration=120&budget=3000&audience=solo&mood=shopping&assurance=toilet");
    await page.screenshot({ path: `${output}/plan-result-${width === 1440 ? "desktop" : "mobile"}.png`, fullPage: true });
  }

  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: width === 1440 ? 1000 : 844 });
    await page.goto("/osanpo/courses/koenji-first/#course-customizer");
    await page.locator("#course-customizer").screenshot({ path: `${output}/course-customize-${width === 1440 ? "desktop" : "mobile"}.png` });
  }

  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/osanpo/contact/");
  await page.screenshot({ path: `${output}/contact-form-desktop.png`, fullPage: true });

  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/osanpo/");
  await page.getByRole("button", { name: "初めての高円寺：商店街と路地を2時間で歩くの地図を見る" }).click();
  await page.screenshot({ path: `${output}/home-course-map-desktop.png`, fullPage: true });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/osanpo/");
  await page.getByRole("button", { name: "初めての高円寺：商店街と路地を2時間で歩くの地図を見る" }).click();
  await page.screenshot({ path: `${output}/home-course-map-mobile.png`, fullPage: true });

  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/osanpo/courses/");
  await page.getByRole("button", { name: "初めての高円寺：商店街と路地を2時間で歩くの地図を見る" }).click();
  await page.screenshot({ path: `${output}/courses-map-desktop.png`, fullPage: true });
  await page.locator(".course-map-drawer").screenshot({ path: `${output}/course-map-expanded.png` });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/osanpo/courses/");
  await page.getByRole("button", { name: "初めての高円寺：商店街と路地を2時間で歩くの地図を見る" }).click();
  await page.screenshot({ path: `${output}/courses-map-mobile.png`, fullPage: true });

  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/osanpo/business/contact/");
  await page.screenshot({ path: `${output}/business-contact-desktop.png`, fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: `${output}/business-contact-mobile.png`, fullPage: true });
});
