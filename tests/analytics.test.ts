import { describe, expect, it } from "vitest";
import { safeAnalyticsLocation } from "@/components/Analytics";

describe("analytics privacy", () => {
  it("removes query strings and hashes from page location", () => {
    expect(safeAnalyticsLocation("https://nobuja0428.github.io/osanpo/search/?q=個人情報#results")).toBe("https://nobuja0428.github.io/osanpo/search/");
  });

  it("returns an empty value for invalid URLs", () => {
    expect(safeAnalyticsLocation("not a URL")).toBe("");
  });
});
