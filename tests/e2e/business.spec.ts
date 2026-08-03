import { expect, test } from "@playwright/test";

test("business pages expose services, reference pricing, and only self-owned examples", async ({ page }) => {
  await page.goto("/osanpo/business/");
  await expect(page.getByRole("heading", { name: "地域のお店の魅力を、地図とWebで伝える" })).toBeVisible();
  await expect(page.getByRole("link", { name: "詳しく見る →" })).toHaveCount(3);
  await expect(page.getByText("掲載申請は準備中")).toBeVisible();
  await page.getByRole("link", { name: "詳しく見る →" }).first().click();
  await expect(page).toHaveURL(/\/osanpo\/business\/store-page\/$/);
  await expect(page.locator(".business-price")).toContainText("30,000円〜");
  await expect(page.getByText("参考価格", { exact: false }).first()).toBeVisible();

  await page.goto("/osanpo/business/examples/");
  await expect(page.getByRole("heading", { name: "自社開発の地域メディア実例" })).toBeVisible();
  await expect(page.getByText("外部のお客様の事例や成果実績ではなく")).toBeVisible();
});

test("business contact stays non-interactive while configuration is disabled", async ({ page }) => {
  await page.goto("/osanpo/business/contact/");
  await expect(page.getByText("受付準備中", { exact: true })).toBeVisible();
  await expect(page.locator("form, input, textarea, select")).toHaveCount(0);
  await expect(page.locator('a[href^="mailto:"], a[href*="forms.gle"], a[href*="docs.google.com/forms"]')).toHaveCount(0);
});

test("business pages do not request analytics when GA is disabled and remain keyboard reachable", async ({ page }) => {
  const analyticsRequests: string[] = [];
  page.on("request", (request) => { if (/googletagmanager|google-analytics/.test(request.url())) analyticsRequests.push(request.url()); });
  await page.goto("/osanpo/business/");
  const serviceLink = page.getByRole("link", { name: "詳しく見る →" }).first();
  await serviceLink.focus();
  await expect(serviceLink).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/osanpo\/business\/store-page\/$/);
  expect(analyticsRequests).toEqual([]);
});
