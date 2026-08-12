import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const formUrl = "https://docs.google.com/forms/d/e/1FAIpQLSfjBa3cxGBrjEUSLEDY8ZkcvFs4xU5PXzNW6CbpZ_0MQgGYyw/viewform?usp=dialog";

test("production shows one House Ad at each approved placement and no AdSense script", async ({ page }) => {
  const cases = [
    { path: "", placement: "home-after-courses" },
    { path: "courses/", placement: "courses-after-grid" },
    { path: "courses/koenji-first/", placement: "course-detail-after-info" },
    { path: "areas/koenji/", placement: "area-detail-after-courses" },
    { path: "spots/koenji-junjo/", placement: "spot-detail-end" },
    { path: "stories/koenji-shopping-streets/", placement: "story-end" },
  ];

  for (const item of cases) {
    await page.goto(item.path);
    const slot = page.locator(`.monetization-slot-house[data-placement="${item.placement}"]`);
    await expect(slot).toHaveCount(1);
    await expect(page.locator(".monetization-slot-house")).toHaveCount(1);
    await expect(slot.getByText("広告募集中", { exact: true })).toBeVisible();
    await expect(slot.getByText("この広告枠に、地域のお店・サービスを掲載できます。", { exact: true })).toBeVisible();
    await expect(slot.getByText("高円寺・吉祥寺・浅草を歩く人へ、店舗・商品・サービスの魅力を伝える地域スポンサーを募集しています。", { exact: true })).toBeVisible();
    await expect(slot.getByText(/実広告の掲載時は「広告」または「スポンサー」と明示します。/)).toBeVisible();
    await expect(slot).toHaveAttribute("data-slot-status", "recruiting");
    const cta = slot.getByRole("link", { name: /広告掲載を相談する/ });
    await expect(cta).toHaveAttribute("href", formUrl);
    await expect(cta).toHaveAttribute("target", "_blank");
    await expect(cta).toHaveAttribute("rel", "noopener noreferrer");
    await expect(slot.getByRole("link", { name: /広告枠・掲載内容を見る/ })).toHaveAttribute("href", "/osanpo/advertise/");
    await expect(page.locator('script[src*="googlesyndication"], script[src*="adsbygoogle"]')).toHaveCount(0);
  }

  await page.goto("stories/koenji-shopping-streets/");
  await expect(page.locator('.monetization-slot[data-placement="story-middle"]')).toHaveCount(0);
  await expect(page.locator('.monetization-slot[data-placement="story-end"]')).toHaveCount(1);
});

test("recruitment slots are isolated from maps, walking routes, planner, and contact actions", async ({ page }) => {
  const detailCases = [
    { path: "courses/koenji-first/", placement: "course-detail-after-info" },
    { path: "areas/koenji/", placement: "area-detail-after-courses" },
    { path: "spots/koenji-junjo/", placement: "spot-detail-end" },
  ];

  for (const item of detailCases) {
    await page.goto(item.path);
    const slot = page.locator(`.monetization-slot[data-placement="${item.placement}"]`);
    await expect(slot).toHaveCount(1);
    await expect(slot.locator("xpath=ancestor::*[contains(concat(' ', normalize-space(@class), ' '), ' detail-grid ')]")).toHaveCount(0);
    await expect(slot.locator("xpath=ancestor::*[contains(concat(' ', normalize-space(@class), ' '), ' route-actions ')]")).toHaveCount(0);
    await expect(slot.locator("xpath=ancestor::*[contains(concat(' ', normalize-space(@class), ' '), ' map-frame-shell ')]")).toHaveCount(0);
    await expect(slot.locator("xpath=ancestor::*[contains(concat(' ', normalize-space(@class), ' '), ' planner-panel ')]")).toHaveCount(0);
    await expect(slot.locator("xpath=ancestor::*[contains(concat(' ', normalize-space(@class), ' '), ' advertise-contact ')]")).toHaveCount(0);
    await expect(slot.locator("xpath=ancestor::*[contains(concat(' ', normalize-space(@class), ' '), ' detail-monetization ')]")).toHaveCount(1);
  }

  await page.goto("courses/");
  await expect(page.locator('.monetization-section .monetization-slot[data-placement="courses-after-grid"]')).toHaveCount(1);

  await page.goto("");
  const topSlot = page.locator('.monetization-slot[data-placement="home-after-courses"]');
  await expect(topSlot).toHaveCount(1);
  expect(await topSlot.evaluate((slot) => slot.previousElementSibling?.classList.contains("card-grid"))).toBe(true);
});

test("House Ad impression and click fire once with safe GA4 fields", async ({ page }) => {
  await page.addInitScript(() => {
    const testWindow = window as typeof window & { monetizationEvents: unknown[][] };
    testWindow.monetizationEvents = [];
    window.gtag = (...args: unknown[]) => testWindow.monetizationEvents.push(args);
  });
  await page.goto("");
  const slot = page.locator('.monetization-slot-house[data-placement="home-after-courses"]');
  await slot.scrollIntoViewIfNeeded();
  await expect.poll(() => page.evaluate(() => (window as typeof window & { monetizationEvents: unknown[][] }).monetizationEvents.length)).toBe(1);
  const impression = await page.evaluate(() => (window as typeof window & { monetizationEvents: unknown[][] }).monetizationEvents[0]);
  expect(impression).toEqual(["event", "house_ad_impression", {
    ad_type: "house",
    placement: "home-after-courses",
    sponsor_id: "",
    page_type: "home",
    content_id: "home",
    area_id: "",
  }]);

  await slot.getByRole("link", { name: /広告掲載を相談する/ }).evaluate((link) => link.addEventListener("click", (event) => event.preventDefault(), { once: true }));
  await slot.getByRole("link", { name: /広告掲載を相談する/ }).click();
  await expect.poll(() => page.evaluate(() => (window as typeof window & { monetizationEvents: unknown[][] }).monetizationEvents.length)).toBe(2);
  const click = await page.evaluate(() => (window as typeof window & { monetizationEvents: unknown[][] }).monetizationEvents[1]);
  expect(click).toEqual(["event", "house_ad_click", expect.objectContaining({
    ad_type: "house",
    page_type: "home",
    content_id: "home",
    area_id: "",
    placement: "home-after-courses",
  })]);

  await page.evaluate(() => window.scrollTo(0, 0));
  await slot.scrollIntoViewIfNeeded();
  await page.waitForTimeout(150);
  expect(await page.evaluate(() => (window as typeof window & { monetizationEvents: unknown[][] }).monetizationEvents.length)).toBe(2);
});

test("business and advertising pages expose the real sponsor form without invented pricing", async ({ page }) => {
  await page.goto("business/");
  await expect(page.getByRole("link", { name: /スポンサー掲載について相談する/ })).toHaveAttribute("href", formUrl);
  await expect(page.getByText("掲載による成果、検索順位、来店数、売上などを保証するものではありません。", { exact: true })).toBeVisible();
  await page.goto("advertise/");
  await expect(page.getByRole("heading", { name: "掲載後の表示イメージ" })).toBeVisible();
  await expect(page.getByText("掲載内容・位置・期間を確認したうえで個別にご案内します。", { exact: false })).toHaveCount(1);
  await expect(page.getByRole("link", { name: /スポンサー掲載について相談する/ })).toHaveAttribute("href", formUrl);
  await expect(page.getByText(/月額|初期費用|PV|CTR|売上効果/)).toHaveCount(0);
});

test("test-only sponsor replaces House Ad, respects expiry, and remains accessible", async ({ page }) => {
  await page.goto("");
  await page.locator(".monetization-slot-house").waitFor({ state: "visible" });
  await page.waitForTimeout(100);
  await page.evaluate(() => {
    const testWindow = window as typeof window & { monetizationEvents: unknown[][] };
    testWindow.monetizationEvents = [];
    window.gtag = (...args: unknown[]) => testWindow.monetizationEvents.push(args);
    document.querySelector(".monetization-slot-house")?.remove();

    const visible = document.createElement("aside");
    visible.className = "monetization-slot monetization-slot-sponsor";
    visible.setAttribute("aria-label", "スポンサー情報");
    visible.innerHTML = '<span class="monetization-label">スポンサー</span><div class="monetization-copy"><p class="monetization-title">テスト環境スポンサー</p><p class="monetization-headline">テスト環境だけの表示です。</p><a class="button button-secondary monetization-cta" href="#sponsor-test" target="_blank" rel="noopener noreferrer sponsored" data-analytics-event="sponsor_click" data-ad-type="sponsor" data-sponsor-id="test-sponsor" data-page-type="home" data-content-id="home" data-area-id="koenji" data-placement="home-after-courses">詳しく見る ↗</a></div>';
    visible.style.height = "180px";
    visible.dataset.monetizationImpression = "sponsor_impression";
    visible.dataset.adType = "sponsor";
    visible.dataset.sponsorId = "test-sponsor";
    visible.dataset.pageType = "home";
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

  await page.locator(".monetization-slot-sponsor").scrollIntoViewIfNeeded();
  await expect.poll(() => page.evaluate(() => (window as typeof window & { monetizationEvents: unknown[][] }).monetizationEvents.length)).toBe(1);
  const event = await page.evaluate(() => (window as typeof window & { monetizationEvents: unknown[][] }).monetizationEvents[0]);
  expect(event).toEqual(["event", "sponsor_impression", { ad_type: "sponsor", placement: "home-after-courses", sponsor_id: "test-sponsor", page_type: "home", content_id: "home", area_id: "koenji" }]);
  await expect(page.locator("#expired-test-sponsor")).toHaveCount(0);
  await expect(page.getByText("テスト環境スポンサー", { exact: true })).toBeVisible();
  await expect(page.getByText("広告募集中", { exact: true })).toHaveCount(0);

  const accessibility = await new AxeBuilder({ page: page as never }).include(".monetization-slot").analyze();
  expect(accessibility.violations.filter((violation) => ["serious", "critical"].includes(violation.impact ?? ""))).toEqual([]);
});

for (const width of [320, 390]) {
  test(`House Ad is responsive without horizontal overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("");
    const slot = page.locator(".monetization-slot-house");
    await slot.scrollIntoViewIfNeeded();
    const layout = await page.locator("html").evaluate((html) => ({ scrollWidth: html.scrollWidth, clientWidth: html.clientWidth }));
    expect(layout.scrollWidth).toBeLessThanOrEqual(layout.clientWidth);
    expect((await slot.boundingBox())?.height ?? 0).toBeGreaterThanOrEqual(100);
    await expect(slot.getByRole("link", { name: /広告掲載を相談する/ })).toBeVisible();
    const accessibility = await new AxeBuilder({ page: page as never }).include(".monetization-slot-house").analyze();
    expect(accessibility.violations.filter((violation) => ["serious", "critical"].includes(violation.impact ?? ""))).toEqual([]);
  });
}
