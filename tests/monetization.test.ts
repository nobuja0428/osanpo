import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { MonetizationSlot } from "@/components/MonetizationSlot";
import {
  isWithinPublicationWindow,
  monetizationConfig,
  monetizationEvents,
  resolveMonetization,
  type MonetizationConfig,
  type SponsorAd,
} from "@/content/monetization";

const sponsor: SponsorAd = {
  id: "test-sponsor",
  name: "テスト用店舗",
  headline: "テスト環境だけで表示するスポンサーです。",
  description: "本番設定には含めません。",
  href: "https://sponsor.example/landing",
  placements: ["course-detail-after-info"],
  areaId: "koenji",
  startAt: "2026-08-01T00:00:00+09:00",
  endAt: "2026-08-31T23:59:59+09:00",
  active: true,
};

function sponsorConfig(overrides: Partial<MonetizationConfig> = {}): MonetizationConfig {
  return {
    ...monetizationConfig,
    enabled: true,
    sponsorEnabled: true,
    placements: { ...monetizationConfig.placements, "course-detail-after-info": true },
    sponsors: [sponsor],
    ...overrides,
  };
}

describe("monetization production defaults", () => {
  it("keeps all types and placements disabled with no production ads", () => {
    expect(monetizationConfig.enabled).toBe(false);
    expect(monetizationConfig.adsenseEnabled).toBe(false);
    expect(monetizationConfig.sponsorEnabled).toBe(false);
    expect(monetizationConfig.affiliateEnabled).toBe(false);
    expect(Object.values(monetizationConfig.placements).every((enabled) => !enabled)).toBe(true);
    expect(monetizationConfig.sponsors).toEqual([]);
    expect(monetizationConfig.affiliates).toEqual([]);
    expect(monetizationConfig.adsense.publisherId).toBe("");
    expect(Object.values(monetizationConfig.adsense.slots).every((slot) => !slot.slotId && !slot.format)).toBe(true);
  });

  it("renders no DOM and no empty space while monetization is off", () => {
    const html = renderToStaticMarkup(createElement(MonetizationSlot, { placement: "home-after-courses", contentId: "home" }));
    expect(html).toBe("");
  });
});

describe("sponsor eligibility and disclosure", () => {
  const activeNow = new Date("2026-08-09T12:00:00+09:00");

  it("renders a clearly disclosed, sponsored external link only for the matching area", () => {
    const config = sponsorConfig();
    const html = renderToStaticMarkup(createElement(MonetizationSlot, {
      placement: "course-detail-after-info",
      contentId: "koenji-first",
      areaId: "koenji",
      config,
      now: activeNow,
    }));
    expect(html).toContain("スポンサー");
    expect(html).toContain("テスト用店舗");
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer sponsored"');
    expect(html).toContain('data-monetization-impression="sponsor_impression"');
    expect(html).toContain('data-analytics-event="sponsor_click"');
    expect(html).toContain('data-sponsor-id="test-sponsor"');
    expect(html).not.toContain("人気");
    expect(html).not.toContain("ランキング");
  });

  it("does not render for another area or outside the publication window", () => {
    const config = sponsorConfig();
    expect(resolveMonetization("course-detail-after-info", { areaId: "asakusa", now: activeNow }, config)).toBeNull();
    expect(resolveMonetization("course-detail-after-info", { areaId: "koenji", now: new Date("2026-09-01T00:00:00+09:00") }, config)).toBeNull();
    expect(isWithinPublicationWindow(sponsor.startAt, sponsor.endAt, activeNow)).toBe(true);
    expect(isWithinPublicationWindow(sponsor.startAt, sponsor.endAt, new Date("2026-07-31T23:59:59+09:00"))).toBe(false);
  });
});

describe("affiliate and adsense readiness", () => {
  it("renders an affiliate only when its approved link and placement are active", () => {
    const config: MonetizationConfig = {
      ...monetizationConfig,
      enabled: true,
      affiliateEnabled: true,
      placements: { ...monetizationConfig.placements, "story-end": true },
      affiliates: [{ id: "test-affiliate", label: "テスト用リンク", href: "https://affiliate.example/item", placements: ["story-end"], active: true }],
    };
    const html = renderToStaticMarkup(createElement(MonetizationSlot, { placement: "story-end", contentId: "test-story", config }));
    expect(html).toContain("広告");
    expect(html).toContain('data-analytics-event="affiliate_click"');
    expect(html).toContain('rel="noopener noreferrer sponsored"');
  });

  it("never emits an AdSense element or script in this release", () => {
    const config: MonetizationConfig = {
      ...monetizationConfig,
      enabled: true,
      adsenseEnabled: true,
      placements: { ...monetizationConfig.placements, "home-after-courses": true },
      adsense: {
        publisherId: "ca-pub-test-only",
        slots: { ...monetizationConfig.adsense.slots, "home-after-courses": { slotId: "test-slot", format: "auto" } },
      },
    };
    const html = renderToStaticMarkup(createElement(MonetizationSlot, { placement: "home-after-courses", contentId: "home", config }));
    expect(resolveMonetization("home-after-courses", {}, config)?.type).toBe("adsense");
    expect(monetizationEvents.adsense).toEqual({ impression: "ad_impression", click: "ad_click" });
    expect(html).toBe("");
    expect(html).not.toContain("adsbygoogle");
  });
});
