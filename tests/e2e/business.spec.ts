import { expect, test } from "@playwright/test";

test("business pages expose services, reference pricing, and only self-owned examples", async ({ page }) => {
  await page.goto("/osanpo/business/");
  await expect(page.getByRole("heading", { name: "地域のお店の魅力を、地図とWebで伝える" })).toBeVisible();
  await expect(page.getByRole("link", { name: "詳しく見る →" })).toHaveCount(4);
  await expect(page.getByRole("link", { name: "店舗掲載について相談する" })).toHaveAttribute("href", /mailto:osanpo\.contact\.tokyo@gmail\.com\?subject=/);
  await expect(page.getByRole("heading", { name: "よくある課題" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "料金の考え方" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "よくある質問" })).toBeVisible();
  await page.getByRole("link", { name: "詳しく見る →" }).first().click();
  await expect(page).toHaveURL(/\/osanpo\/business\/store-page\/$/);
  await expect(page.locator(".business-price")).toContainText("30,000円〜");
  await expect(page.getByText("参考価格", { exact: false }).first()).toBeVisible();

  await page.goto("/osanpo/business/examples/");
  await expect(page.getByRole("heading", { name: "自社開発の地域メディア実例" })).toBeVisible();
  await expect(page.getByText("外部のお客様の事例や成果実績ではなく")).toBeVisible();
  await expect(page.getByText("Next.js", { exact: true })).toBeVisible();
});

test("business contact exposes the configured subject-safe email link", async ({ page }) => {
  await page.goto("/osanpo/business/contact/");
  await expect(page.getByRole("heading", { name: "メールでご相談を受け付けています" })).toBeVisible();
  await expect(page.locator("form, input, textarea, select")).toHaveCount(0);
  await expect(page.getByRole("link", { name: "メールで相談する" })).toHaveAttribute("href", /mailto:osanpo\.contact\.tokyo@gmail\.com\?subject=/);
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
