import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("production monetization defaults render no slots, blanks, dummy ads, or AdSense script", async ({ page }) => {
  for (const path of ["", "courses/", "courses/koenji-first/", "stories/koenji-shopping-streets/"]) {
    await page.goto(path);
    await expect(page.locator(".monetization-slot, [data-monetization-impression]")).toHaveCount(0);
    await expect(page.locator('script[src*="googlesyndication"], script:has-text("adsbygoogle")')).toHaveCount(0);
    await expect(page.getByText("広告募集中", { exact: true })).toHaveCount(0);
  }
});

test("business page exposes the real sponsor consultation form without a performance promise", async ({ page }) => {
  await page.goto("business/");
  const link = page.getByRole("link", { name: /スポンサー掲載について相談する/ });
  await expect(link).toHaveAttribute("href", "https://docs.google.com/forms/d/e/1FAIpQLSfjBa3cxGBrjEUSLEDY8ZkcvFs4xU5PXzNW6CbpZ_0MQgGYyw/viewform?usp=dialog");
  await expect(link).toHaveAttribute("target", "_blank");
  await expect(page.getByText("掲載による成果、検索順位、来店数、売上などを保証するものではありません。", { exact: true })).toBeVisible();
  await page.goto("advertise/");
  await expect(page.getByRole("link", { name: /スポンサー掲載について相談する/ })).toHaveAttribute("href", "https://docs.google.com/forms/d/e/1FAIpQLSfjBa3cxGBrjEUSLEDY8ZkcvFs4xU5PXzNW6CbpZ_0MQgGYyw/viewform?usp=dialog");
});

test("visible sponsor impressions are measured and expired sponsor DOM is removed", async ({ page }) => {
  await page.goto("");
  await page.evaluate(() => {
    const testWindow = window as typeof window & { monetizationEvents: unknown[][] };
    testWindow.monetizationEvents = [];
    window.gtag = (...args: unknown[]) => testWindow.monetizationEvents.push(args);

    const visible = document.createElement("aside");
    visible.className = "monetization-slot monetization-slot-sponsor";
    visible.setAttribute("aria-label", "スポンサー情報");
    visible.innerHTML = '<span class="monetization-label">スポンサー</span><div class="monetization-copy"><p class="monetization-title">テスト環境スポンサー</p><p class="monetization-headline">テスト環境だけの表示です。</p><a class="button button-secondary monetization-cta" href="#sponsor-test" target="_blank" rel="noopener noreferrer sponsored" data-analytics-event="sponsor_click" data-ad-type="sponsor" data-sponsor-id="test-sponsor" data-content-id="home" data-area-id="koenji" data-placement="home-after-courses">詳しく見る ↗</a></div>';
    visible.style.height = "180px";
    visible.dataset.monetizationImpression = "sponsor_impression";
    visible.dataset.adType = "sponsor";
    visible.dataset.sponsorId = "test-sponsor";
    visible.dataset.contentId = "home";
    visible.dataset.areaId = "koenji";
    visible.dataset.placement = "home-after-courses";
    document.querySelector("main")?.prepend(visible);

    const expired = document.createElement("aside");
    expired.id = "expired-test-sponsor";
    expired.dataset.monetizationImpression = "sponsor_impression";
    expired.dataset.endAt = "2020-01-01T00:00:00Z";
    document.querySelector("main")?.append(expired);
  });

  await expect.poll(() => page.evaluate(() => (window as typeof window & { monetizationEvents: unknown[][] }).monetizationEvents.length)).toBe(1);
  const event = await page.evaluate(() => (window as typeof window & { monetizationEvents: unknown[][] }).monetizationEvents[0]);
  expect(event).toEqual(["event", "sponsor_impression", { ad_type: "sponsor", placement: "home-after-courses", sponsor_id: "test-sponsor", content_id: "home", area_id: "koenji" }]);
  await expect(page.locator("#expired-test-sponsor")).toHaveCount(0);

  await page.locator(".monetization-cta").evaluate((link) => link.addEventListener("click", (clickEvent) => clickEvent.preventDefault(), { once: true }));
  await page.getByRole("link", { name: /詳しく見る/ }).click();
  await expect.poll(() => page.evaluate(() => (window as typeof window & { monetizationEvents: unknown[][] }).monetizationEvents.length)).toBe(2);
  const clickEvent = await page.evaluate(() => (window as typeof window & { monetizationEvents: unknown[][] }).monetizationEvents[1]);
  expect(clickEvent).toEqual(["event", "sponsor_click", expect.objectContaining({ ad_type: "sponsor", sponsor_id: "test-sponsor", content_id: "home", area_id: "koenji", placement: "home-after-courses" })]);

  await page.setViewportSize({ width: 320, height: 800 });
  const layout = await page.locator("html").evaluate((html) => ({ scrollWidth: html.scrollWidth, clientWidth: html.clientWidth }));
  expect(layout.scrollWidth).toBeLessThanOrEqual(layout.clientWidth);
  const accessibility = await new AxeBuilder({ page: page as never }).include(".monetization-slot").analyze();
  expect(accessibility.violations.filter((violation) => ["serious", "critical"].includes(violation.impact ?? ""))).toEqual([]);
});
