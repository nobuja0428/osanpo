import { expect, test } from "@playwright/test";

const routes = [
  "/osanpo/", "/osanpo/areas/", "/osanpo/areas/koenji/", "/osanpo/areas/kichijoji/", "/osanpo/areas/asakusa/",
  "/osanpo/courses/", "/osanpo/courses/koenji-first/", "/osanpo/courses/kichijoji-park/", "/osanpo/courses/asakusa-history/",
  "/osanpo/spots/", "/osanpo/spots/koenji-junjo/", "/osanpo/stories/", "/osanpo/stories/koenji-shopping-streets/", "/osanpo/stories/inokashira-short-walk/", "/osanpo/stories/asakusa-first-hour/",
  "/osanpo/events/", "/osanpo/map/", "/osanpo/search/", "/osanpo/favorites/", "/osanpo/editorial-policy/", "/osanpo/operation/", "/osanpo/advertise/", "/osanpo/contact/", "/osanpo/missing-page/",
];

for (const width of [320, 375, 768, 1024, 1440]) {
  test(`major routes have no horizontal overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const route of routes) {
      await page.goto(route);
      await expect(page.getByRole("banner")).toBeVisible();
      const layout = await page.locator("html").evaluate((html) => ({ scrollWidth: html.scrollWidth, clientWidth: html.clientWidth, imagesLoaded: [...document.images].filter((image) => image.getBoundingClientRect().top < window.innerHeight).every((image) => image.complete && image.naturalWidth > 0) }));
      expect(layout.scrollWidth).toBeLessThanOrEqual(layout.clientWidth);
      expect(layout.imagesLoaded).toBe(true);
    }
  });
}

test("mobile menu opens and closes", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/osanpo/");
  const menu = page.locator("summary.nav-toggle");
  const container = page.locator("details.mobile-nav");
  await expect(container).not.toHaveAttribute("open", "");
  await menu.click();
  await expect(container).toHaveAttribute("open", "");
  await expect(page.getByRole("navigation", { name: "モバイルナビゲーション" })).toBeVisible();
  await menu.click();
  await expect(container).not.toHaveAttribute("open", "");
});

test("key content remains readable without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:4173/osanpo/");
  await expect(page.getByRole("heading", { name: "きょうの東京を、 歩いて見つけよう。" })).toBeVisible();
  await page.goto("http://127.0.0.1:4173/osanpo/courses/koenji-first/");
  await expect(page.getByRole("heading", { name: "1. 電車・駅情報" })).toBeVisible();
  await context.close();
});
