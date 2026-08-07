import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

for (const path of ["/osanpo/", "/osanpo/plan/", "/osanpo/search/", "/osanpo/courses/koenji-first/", "/osanpo/events/", "/osanpo/favorites/", "/osanpo/business/", "/osanpo/business/store-page/", "/osanpo/business/contact/", "/osanpo/missing-page/"]) {
  test(`has no serious or critical axe violations: ${path}`, async ({ page }) => {
    await page.goto(path);
    const results = await new AxeBuilder({ page: page as never }).analyze();
    const serious = results.violations.filter((violation) => ["serious", "critical"].includes(violation.impact ?? ""));
    expect(serious).toEqual([]);
  });
}
