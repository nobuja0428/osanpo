import { expect, test } from "@playwright/test";

test("primary navigation, mobile navigation, hero search, and footer links respond", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/osanpo/");
  await page.getByRole("banner").getByRole("link", { name: "コース" }).click();
  await expect(page).toHaveURL(/\/osanpo\/courses\/$/);

  await page.goto("/osanpo/");
  await page.getByPlaceholder("街、商店街、歴史から探す").fill("浅草");
  await page.getByRole("button", { name: "検索する" }).click();
  await expect(page).toHaveURL(/\/osanpo\/courses\/\?keyword=/);
  await expect(page.getByText("浅草：雷門からかっぱ橋へ、門前町の歴史を歩く", { exact: true })).toBeVisible();

  await page.getByRole("contentinfo").getByRole("link", { name: "お問い合わせ" }).click();
  await expect(page).toHaveURL(/\/osanpo\/contact\/$/);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/osanpo/");
  await page.locator("summary.nav-toggle").click();
  await page.getByRole("navigation", { name: "モバイルナビゲーション" }).getByRole("link", { name: "地図" }).click();
  await expect(page).toHaveURL(/\/osanpo\/map\/$/);
  await page.getByRole("navigation", { name: "モバイル主要ナビ" }).getByRole("link", { name: "お気に入り" }).click();
  await expect(page).toHaveURL(/\/osanpo\/favorites\/$/);
});

test("wide card click areas navigate for every public card type", async ({ page }) => {
  const cases = [
    ["/osanpo/courses/", "/osanpo/courses/koenji-first/"],
    ["/osanpo/areas/", "/osanpo/areas/koenji/"],
    ["/osanpo/spots/", "/osanpo/spots/koenji-junjo/"],
    ["/osanpo/stories/", "/osanpo/stories/koenji-shopping-streets/"],
    ["/osanpo/events/", "/osanpo/events/kagurazaka-festival-2026/"],
  ] as const;
  for (const [listPath, destination] of cases) {
    await page.goto(listPath);
    const card = page.locator("article.card").filter({ has: page.locator(`a[href="${destination}"]`) });
    await expect(card).toHaveCount(1);
    await card.evaluate((element) => {
      window.scrollTo({ top: window.scrollY + element.getBoundingClientRect().top - 100 });
    });
    const mediaBox = await card.locator(".card-media").boundingBox();
    expect(mediaBox).not.toBeNull();
    const mediaLink = card.locator(".card-media-link");
    if (await mediaLink.count()) await mediaLink.click();
    else await page.mouse.click(mediaBox!.x + mediaBox!.width / 2, mediaBox!.y + mediaBox!.height / 2);
    await expect(page).toHaveURL(new RegExp(`${destination.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`));
  }

  await page.goto("/osanpo/business/");
  const serviceCard = page.locator("article.business-card").filter({ has: page.getByRole("heading", { name: "店舗紹介ページ制作" }) });
  await expect(serviceCard).toHaveCount(1);
  await serviceCard.scrollIntoViewIfNeeded();
  const serviceBox = await serviceCard.boundingBox();
  expect(serviceBox).not.toBeNull();
  await page.mouse.click(serviceBox!.x + serviceBox!.width / 2, serviceBox!.y + serviceBox!.height / 2);
  await expect(page).toHaveURL(/\/osanpo\/business\/store-page\/$/);
});

test("course cards open, switch, close, navigate, and keep one map iframe", async ({ page }) => {
  await page.goto("/osanpo/");
  await expect(page.locator('iframe[src*="google.com/maps"]')).toHaveCount(1);
  await page.getByRole("button", { name: "初めての高円寺：商店街と路地を2時間で歩くの地図を見る" }).click();
  await expect(page.getByRole("region", { name: "初めての高円寺：商店街と路地を2時間で歩くの展開地図" })).toBeVisible();
  await expect(page.locator('iframe[src*="google.com/maps"]')).toHaveCount(1);
  await expect(page.locator('[data-course-id="koenji-first"]')).toHaveClass(/is-selected/);

  await page.getByRole("button", { name: "吉祥寺：井の頭公園と商店街を半日でつなぐの地図を見る" }).click();
  await expect(page.getByRole("region", { name: "吉祥寺：井の頭公園と商店街を半日でつなぐの展開地図" })).toBeVisible();
  await expect(page.locator('iframe[src*="google.com/maps"]')).toHaveCount(1);

  await page.getByRole("button", { name: "吉祥寺：井の頭公園と商店街を半日でつなぐの地図を閉じる" }).click();
  await expect(page.getByRole("region", { name: "吉祥寺：井の頭公園と商店街を半日でつなぐの展開地図" })).toHaveCount(0);
  await expect(page.locator('iframe[src*="google.com/maps"]')).toHaveCount(1);

  const courseCard = page.locator('[data-course-id="koenji-first"]');
  await courseCard.getByRole("link", { name: "初めての高円寺：商店街と路地を2時間で歩く" }).focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/osanpo\/courses\/koenji-first\/$/);
});

test("filters, favorites, external walking route, and contact links respond", async ({ page }) => {
  await page.goto("/osanpo/courses/");
  await page.getByLabel("エリア").selectOption("asakusa");
  await expect(page.getByText("1件のコース", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "浅草 を解除" }).click();
  await expect(page.getByText("3件のコース", { exact: true })).toBeVisible();

  await page.goto("/osanpo/courses/koenji-first/");
  await page.getByRole("button", { name: "お気に入りに追加" }).click();
  await expect(page.getByRole("button", { name: "お気に入り済み" })).toBeVisible();
  const popupPromise = page.waitForEvent("popup");
  await page.context().route("https://www.google.com/maps/dir/**", (route) => route.fulfill({ status: 200, contentType: "text/html", body: "<!doctype html><title>Google Maps route test</title>" }));
  await page.getByRole("link", { name: "コース全体の徒歩ルートを開く" }).click();
  const popup = await popupPromise;
  await expect(popup).toHaveURL(/travelmode=walking/);
  await popup.close();

  await page.goto("/osanpo/contact/");
  const formLink = page.getByRole("link", { name: "お問い合わせフォームを開く" });
  await expect(formLink).toHaveAttribute("href", "https://docs.google.com/forms/d/e/1FAIpQLSfjBa3cxGBrjEUSLEDY8ZkcvFs4xU5PXzNW6CbpZ_0MQgGYyw/viewform?usp=dialog");
  await expect(formLink).toHaveAttribute("target", "_blank");
  await expect(formLink).toHaveAttribute("rel", "noopener noreferrer");
  const mailLink = page.getByRole("link", { name: "メールを作成する" });
  await expect(mailLink).toHaveAttribute("href", /^mailto:osanpo\.contact\.tokyo@gmail\.com\?subject=/);
  await mailLink.click({ noWaitAfter: true });
  await expect(page).toHaveURL(/\/osanpo\/contact\/$/);

  await page.goto("/osanpo/missing-page/");
  await page.getByRole("link", { name: "トップへ戻る" }).click();
  await expect(page).toHaveURL(/\/osanpo\/$/);
});

test("map page reuses one iframe when course maps are selected", async ({ page }) => {
  await page.goto("/osanpo/map/");
  await page.getByRole("tab", { name: "高円寺" }).click();
  await page.getByRole("button", { name: "初めての高円寺：商店街と路地を2時間で歩くの地図を見る" }).click();
  await expect(page.getByRole("tabpanel").getByRole("heading", { name: "初めての高円寺：商店街と路地を2時間で歩く" })).toBeVisible();
  await expect(page.locator('iframe[src*="google.com/maps"]')).toHaveCount(1);
  await page.getByRole("button", { name: "初めての高円寺：商店街と路地を2時間で歩くの地図を閉じる" }).click();
  await expect(page.getByRole("tabpanel").getByRole("heading", { name: "高円寺", exact: true })).toBeVisible();
});

test("course map controls are available on courses, search, and area pages", async ({ page }) => {
  for (const route of ["/osanpo/courses/", "/osanpo/search/?q=高円寺", "/osanpo/areas/koenji/"]) {
    await page.goto(route);
    await page.getByRole("button", { name: "初めての高円寺：商店街と路地を2時間で歩くの地図を見る" }).click();
    await expect(page.getByRole("region", { name: "初めての高円寺：商店街と路地を2時間で歩くの展開地図" })).toBeVisible();
    await expect(page.locator('iframe[src*="google.com/maps"]')).toHaveCount(1);
    await page.getByRole("button", { name: "初めての高円寺：商店街と路地を2時間で歩くの地図を閉じる" }).click();
  }
});
