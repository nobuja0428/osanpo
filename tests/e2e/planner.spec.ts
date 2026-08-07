import { expect, test } from "@playwright/test";

const formUrl = "https://docs.google.com/forms/d/e/1FAIpQLSfjBa3cxGBrjEUSLEDY8ZkcvFs4xU5PXzNW6CbpZ_0MQgGYyw/viewform?usp=dialog";

test("planner completes five questions, explains results, restores URL, and supports history", async ({ page }) => {
  await page.goto("/osanpo/plan/");
  await expect(page.getByRole("heading", { name: "質問1：使える時間" })).toBeVisible();
  await page.getByRole("button", { name: "2時間以内" }).click();
  await page.getByRole("button", { name: "次へ" }).click();
  await page.getByRole("button", { name: "3,000円以内" }).click();
  await page.getByRole("button", { name: "次へ" }).click();
  await page.getByRole("button", { name: "ひとり" }).click();
  await page.getByRole("button", { name: "次へ" }).click();
  await page.getByRole("button", { name: "商店街・買い物" }).click();
  await page.getByRole("button", { name: "次へ" }).click();
  await page.getByLabel("トイレ情報がある").check();
  await page.getByRole("button", { name: "結果を見る" }).click();
  await expect(page.getByRole("heading", { name: "今日のおさんぽ候補" })).toBeVisible();
  await expect(page.locator(".planner-result-card")).toHaveCount(3);
  const favorite = page.locator(".planner-result-card [data-favorite-key]").first();
  await favorite.click();
  await expect(favorite).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("heading", { name: "初めての高円寺：商店街と路地を2時間で歩く" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "おすすめした理由" }).first()).toBeVisible();
  await expect(page).toHaveURL(/duration=120.*budget=3000.*audience=solo.*mood=shopping.*assurance=toilet/);

  const restoredUrl = page.url();
  await page.reload();
  await expect(page.locator(".planner-result-card [data-favorite-key]").first()).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("heading", { name: "今日のおさんぽ候補" })).toBeVisible();
  await expect(page.url()).toBe(restoredUrl);
  await page.getByRole("button", { name: "最初からやり直す" }).click();
  await expect(page.getByRole("heading", { name: "質問1：使える時間" })).toBeVisible();
  await expect(page).toHaveURL(/\/osanpo\/plan\/$/);
  await page.goBack();
  await expect(page.getByRole("heading", { name: "今日のおさんぽ候補" })).toBeVisible();
  await page.goForward();
  await expect(page.getByRole("heading", { name: "質問1：使える時間" })).toBeVisible();
});

test("planner ignores invalid URL values and shows the closest partial match", async ({ page }) => {
  await page.goto("/osanpo/plan/?duration=999&budget=nope&mood=random");
  await expect(page.getByRole("heading", { name: "質問1：使える時間" })).toBeVisible();
  await page.goto("/osanpo/plan/?duration=60&budget=1000&audience=date&mood=history");
  await expect(page.getByText("一部の条件とは一致しません").first()).toBeVisible();
  await expect(page.locator(".planner-result-card")).toHaveCount(3);
});

test("course route customizer keeps endpoints, saves stops, restores, resets, and shares safely", async ({ page }) => {
  await page.goto("/osanpo/courses/koenji-first/");
  const fixed = page.locator(".custom-stop-list input:disabled");
  await expect(fixed).toHaveCount(2);
  await expect(fixed.nth(0)).toBeChecked();
  await expect(fixed.nth(1)).toBeChecked();
  const optional = page.locator(".custom-stop-list input:not(:disabled)");
  await optional.first().uncheck();
  await expect(optional.first()).not.toBeChecked();
  await expect(page).toHaveURL(/stops=1%2C3%2C4%2C5%2C6%2C7/);
  await page.reload();
  await expect(page.locator(".custom-stop-list input:not(:disabled)").first()).not.toBeChecked();
  await page.locator(".custom-stop-list input:not(:disabled)").first().check();
  await expect(page.getByRole("link", { name: "調整した徒歩ルートを開く" })).toHaveAttribute("href", /travelmode=walking/);
  await expect(page.getByRole("link", { name: "前半ルートを開く" })).toHaveAttribute("href", /travelmode=walking/);
  await expect(page.getByRole("link", { name: "後半ルートを開く" })).toHaveAttribute("href", /travelmode=walking/);
  await page.getByRole("button", { name: "元のコースに戻す" }).click();
  await expect(page.locator(".custom-stop-list input:checked")).toHaveCount(7);
  await page.evaluate(() => Object.defineProperty(navigator, "share", { configurable: true, value: undefined }));
  await page.getByRole("button", { name: "このプランを共有" }).click();
  await expect(page.getByRole("status")).toContainText(/リンクをコピーしました|コピーできませんでした/);

  await page.goto("/osanpo/courses/koenji-first/?stops=999,-1");
  await expect(page.locator(".custom-stop-list input:checked")).toHaveCount(2);
  await expect(page.getByText("選択中：2地点（START・GOALを含む）")).toBeVisible();
});

test("Google form opens in a new tab with the exact URL and email remains available", async ({ page, context }) => {
  await context.route("https://docs.google.com/**", (route) => route.fulfill({ status: 200, contentType: "text/html", body: "<title>Test Google Form</title>" }));
  await page.goto("/osanpo/contact/");
  const popupPromise = page.waitForEvent("popup");
  await page.getByRole("link", { name: "お問い合わせフォームを開く" }).click();
  const popup = await popupPromise;
  expect(popup.url()).toBe(formUrl);
  await popup.close();
  await expect(page.getByRole("link", { name: "メールを作成する" })).toHaveAttribute("href", /^mailto:osanpo\.contact\.tokyo@gmail\.com\?subject=/);
  await expect(page.locator("body")).not.toContainText("受付準備中");
});
