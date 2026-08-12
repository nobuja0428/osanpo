import { expect, test } from "@playwright/test";

test("top page and assets load below the GitHub Pages base path", async ({ page }) => {
  await page.goto("/osanpo/");
  await expect(page.getByRole("heading", { name: "東京を、もっと歩きたくなる。" })).toBeVisible();
  await expect(page.locator('link[rel="stylesheet"]')).toHaveCount(1);
  await expect(page.locator("img").first()).toBeVisible();
  const image = page.locator("img").first();
  await expect(image).toHaveAttribute("src", /\/osanpo\//);
});

test("navigation and course detail work", async ({ page }) => {
  await page.goto("/osanpo/");
  await page.getByRole("banner").getByRole("link", { name: "エリア" }).click();
  await expect(page).toHaveURL(/\/osanpo\/areas\/$/);
  await page.goto("/osanpo/courses/koenji-first/");
  await expect(page.getByRole("heading", { name: "初めての高円寺：商店街と路地を2時間で歩く" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "情報の確認状況" })).toBeVisible();
});

test("search, filtering, individual clear, and empty state work", async ({ page }) => {
  await page.goto("/osanpo/search/");
  await page.getByPlaceholder("街、スポット、気分から検索").fill("高円寺");
  await page.getByRole("button", { name: "検索する" }).click();
  await expect(page.getByText("高円寺純情商店街", { exact: true })).toBeVisible();
  await page.getByPlaceholder("街、スポット、気分から検索").fill("該当なしの語句");
  await page.getByRole("button", { name: "検索する" }).click();
  await expect(page.getByRole("heading", { name: "一致する情報がありません" })).toBeVisible();
  await page.goto("/osanpo/courses/");
  await page.getByLabel("エリアから").selectOption("asakusa");
  await expect(page.getByText("浅草：雷門からかっぱ橋へ、門前町の歴史を歩く", { exact: true })).toBeVisible();
  await page.getByLabel("誰と歩く？").selectOption("date");
  await expect(page.getByRole("heading", { name: "条件に合うコースがありません" })).toBeVisible();
  await page.getByRole("button", { name: "デート を解除" }).click();
  await expect(page.getByText("1件のコース", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "条件をすべて解除" }).click();
  await expect(page.getByText("3件のコース", { exact: true })).toBeVisible();
});

test("favorites persist and can be removed", async ({ page }) => {
  await page.goto("/osanpo/courses/koenji-first/");
  const add = page.getByRole("button", { name: "お気に入りに追加" });
  await add.click();
  await expect(page.getByRole("button", { name: "お気に入り済み" })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("button", { name: "お気に入り済み" })).toBeVisible();
  await page.getByRole("button", { name: "お気に入り済み" }).click();
  await expect(page.getByRole("button", { name: "お気に入りに追加" })).toBeVisible();
});

test("event detail keeps its official and map actions visible", async ({ page }) => {
  await page.goto("/osanpo/events/kagurazaka-festival-2026/");
  await expect(page.getByRole("heading", { name: "第52回 神楽坂まつり" })).toBeVisible();
  await expect(page.getByRole("link", { name: "公式情報を確認" })).toHaveAttribute("href", /^https:\/\//);
  await expect(page.getByRole("link", { name: "会場を地図で見る" })).toHaveAttribute("href", /^https:\/\//);
});

test("embedded maps, area selection, and walking routes are available", async ({ page }) => {
  await page.goto("/osanpo/");
  const homeMap = page.locator("iframe[title='高円寺・吉祥寺・浅草の地図']");
  await expect(homeMap).toHaveAttribute("loading", "lazy");
  await expect(homeMap).toHaveAttribute("src", /google\.com\/maps/);

  await page.goto("/osanpo/map/");
  const tabs = page.getByRole("tab");
  await expect(tabs).toHaveCount(3);
  await page.getByRole("tab", { name: "吉祥寺" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("tabpanel").getByRole("heading", { name: "吉祥寺", exact: true })).toBeVisible();
  await page.getByRole("tab", { name: "浅草" }).click();
  await expect(page.getByRole("tabpanel").getByRole("heading", { name: "浅草", exact: true })).toBeVisible();

  await page.goto("/osanpo/courses/koenji-first/");
  await expect(page.locator(".route-list").getByText("START", { exact: true })).toBeVisible();
  await expect(page.locator(".route-list").getByText("GOAL", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "コース全体の徒歩ルートを開く" })).toHaveAttribute("href", /travelmode=walking/);
  await expect(page.getByRole("link", { name: /徒歩ルートで見る/ }).first()).toHaveAttribute("href", /travelmode=walking/);
});

test("legacy hash URLs redirect and 404 stays inside the site", async ({ page }) => {
  await page.goto("/osanpo/#/course/koenji-first?keyword=高円寺");
  await expect(page).toHaveURL(/\/osanpo\/courses\/koenji-first\/?\?q=/);
  await page.goto("/osanpo/missing-page/");
  await expect(page.getByRole("heading", { name: "ページが見つかりません" })).toBeVisible();
  await expect(page.getByRole("link", { name: "トップへ戻る" })).toHaveAttribute("href", "/osanpo/");
});

test("official links are HTTPS external links", async ({ page }) => {
  await page.goto("/osanpo/courses/koenji-first/");
  const links = page.locator('a[target="_blank"]');
  await expect(links).not.toHaveCount(0);
  const hrefs = await links.evaluateAll((items) => items.map((item) => item.getAttribute("href")));
  expect(hrefs.every((href) => href?.startsWith("https://"))).toBe(true);
});

test("top, area, course, and story pages form a real internal circulation path", async ({ page }) => {
  await page.goto("/osanpo/");
  await page.getByRole("link", { name: "初めての高円寺：商店街と路地を2時間で歩く" }).first().click();
  await expect(page.getByRole("heading", { name: "次に歩くなら" })).toBeVisible();
  await page.locator("#course-related").getByRole("link", { name: /吉祥寺/ }).first().click();
  await expect(page).toHaveURL(/\/osanpo\/courses\/kichijoji-park\/$/);

  await page.goto("/osanpo/stories/koenji-shopping-streets/");
  await expect(page.getByRole("heading", { name: "この記事の目次" })).toBeVisible();
  await page.getByRole("link", { name: "初めての高円寺：商店街と路地を2時間で歩く" }).click();
  await expect(page).toHaveURL(/\/osanpo\/courses\/koenji-first\/$/);

  await page.goto("/osanpo/areas/koenji/");
  await expect(page.getByText("公開中コース", { exact: true })).toBeVisible();
  await page.getByRole("link", { name: "初めての高円寺：商店街と路地を2時間で歩く" }).first().click();
  await expect(page).toHaveURL(/\/osanpo\/courses\/koenji-first\/$/);
});
