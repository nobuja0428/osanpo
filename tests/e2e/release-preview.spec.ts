import { test } from "@playwright/test";

const output = "reports/release-preview";

test("capture release preview screenshots", async ({ page }) => {
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
