import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { MonetizationSlot } from "@/components/MonetizationSlot";
import {
  adsensePlacementIsReady,
  isWithinPublicationWindow,
  monetizationConfig,
  monetizationEvents,
  resolveMonetization,
  shouldLoadAdsenseScript,
  type AffiliatePlacement,
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

const affiliate: AffiliatePlacement = {
  id: "test-affiliate",
  label: "テスト用リンク",
  description: "テスト環境だけのaffiliateです。",
  href: "https://affiliate.example/item",
  placements: ["story-end"],
  active: true,
};

function sponsorConfig(overrides: Partial<MonetizationConfig> = {}): MonetizationConfig {
  return {
    ...monetizationConfig,
    sponsorEnabled: true,
    sponsors: [sponsor],
    ...overrides,
  };
}

function readyAdsenseConfig(overrides: Partial<MonetizationConfig> = {}): MonetizationConfig {
  return {
    ...monetizationConfig,
    adsenseEnabled: true,
    adsenseProductionReady: true,
    adsenseConsentReady: true,
    adsense: {
      publisherId: "ca-pub-1234567890123456",
      slots: {
        ...monetizationConfig.adsense.slots,
        "home-after-courses": { slotId: "1234567890", format: "auto" },
      },
    },
    ...overrides,
  };
}

describe("production House Ad defaults", () => {
  it("enables only House Ads at the six approved placements", () => {
    expect(monetizationConfig.enabled).toBe(true);
    expect(monetizationConfig.houseAdsEnabled).toBe(true);
    expect(monetizationConfig.adsenseEnabled).toBe(false);
    expect(monetizationConfig.adsenseProductionReady).toBe(false);
    expect(monetizationConfig.adsenseConsentReady).toBe(false);
    expect(monetizationConfig.sponsorEnabled).toBe(false);
    expect(monetizationConfig.affiliateEnabled).toBe(false);
    expect(monetizationConfig.housePlacements).toEqual({
      "home-after-courses": true,
      "courses-after-grid": true,
      "course-detail-after-info": true,
      "area-detail-after-courses": true,
      "spot-detail-end": true,
      "story-middle": false,
      "story-end": true,
    });
    expect(monetizationConfig.sponsors).toEqual([]);
    expect(monetizationConfig.affiliates).toEqual([]);
    expect(monetizationConfig.adsense.publisherId).toBe("");
  });

  it("renders a clearly disclosed House Ad and no House Ad in story middle", () => {
    const html = renderToStaticMarkup(createElement(MonetizationSlot, { placement: "home-after-courses", contentId: "home" }));
    expect(html).toContain("広告募集中");
    expect(html).toContain("この広告枠に、地域のお店・サービスを掲載できます。");
    expect(html).toContain("高円寺・吉祥寺・浅草を歩く人へ、店舗・商品・サービスの魅力を伝える地域スポンサーを募集しています。");
    expect(html).toContain("広告掲載を相談する");
    expect(html).toContain("広告枠・掲載内容を見る");
    expect(html).toContain("実広告の掲載時は「広告」または「スポンサー」と明示します。");
    expect(html).toContain('data-monetization-impression="house_ad_impression"');
    expect(html).toContain('data-analytics-event="house_ad_click"');
    expect(html).toContain('data-page-type="home"');
    expect(html).toContain('data-slot-status="recruiting"');
    expect(html).toContain('data-slot-format="responsive"');
    expect(html).toContain('data-contact-type="sponsor-inquiry"');
    expect(html).toContain('data-contact-type="advertise-details"');
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
    expect(html).not.toContain("sponsored");
    expect(renderToStaticMarkup(createElement(MonetizationSlot, { placement: "story-middle", contentId: "story" }))).toBe("");
    expect(resolveMonetization("story-end")?.type).toBe("house");
  });
});

describe("sponsor eligibility and priority", () => {
  const activeNow = new Date("2026-08-09T12:00:00+09:00");

  it("replaces House Ad with a disclosed sponsor only for the matching area", () => {
    const config = sponsorConfig();
    const html = renderToStaticMarkup(createElement(MonetizationSlot, {
      placement: "course-detail-after-info",
      contentId: "koenji-first",
      areaId: "koenji",
      config,
      now: activeNow,
    }));
    expect(resolveMonetization("course-detail-after-info", { areaId: "koenji", now: activeNow }, config)?.type).toBe("sponsor");
    expect(html).toContain("スポンサー");
    expect(html).toContain("テスト用店舗");
    expect(html).toContain('rel="noopener noreferrer sponsored"');
    expect(html).toContain('data-monetization-impression="sponsor_impression"');
    expect(html).toContain('data-analytics-event="sponsor_click"');
    expect(html).toContain('data-sponsor-id="test-sponsor"');
    expect(html).not.toContain("広告掲載を相談する");
  });

  it("falls back to House Ad for another area or an expired sponsor", () => {
    const config = sponsorConfig();
    expect(resolveMonetization("course-detail-after-info", { areaId: "asakusa", now: activeNow }, config)?.type).toBe("house");
    expect(resolveMonetization("course-detail-after-info", { areaId: "koenji", now: new Date("2026-09-01T00:00:00+09:00") }, config)?.type).toBe("house");
    expect(isWithinPublicationWindow(sponsor.startAt, sponsor.endAt, activeNow)).toBe(true);
    expect(isWithinPublicationWindow(sponsor.startAt, sponsor.endAt, new Date("2026-07-31T23:59:59+09:00"))).toBe(false);
  });
});

describe("affiliate and AdSense readiness", () => {
  it("uses an active affiliate before House Ad and preserves sponsored rel", () => {
    const config: MonetizationConfig = {
      ...monetizationConfig,
      affiliateEnabled: true,
      affiliates: [affiliate],
    };
    const html = renderToStaticMarkup(createElement(MonetizationSlot, { placement: "story-end", contentId: "test-story", config }));
    expect(resolveMonetization("story-end", {}, config)?.type).toBe("affiliate");
    expect(html).toContain("広告");
    expect(html).toContain('data-analytics-event="affiliate_click"');
    expect(html).toContain('rel="noopener noreferrer sponsored"');
    expect(html).not.toContain("広告掲載を相談する");
  });

  it("renders a responsive AdSense slot only when every readiness condition is true", () => {
    const config = readyAdsenseConfig();
    const html = renderToStaticMarkup(createElement(MonetizationSlot, { placement: "home-after-courses", contentId: "home", config }));
    expect(adsensePlacementIsReady(config, "home-after-courses")).toBe(true);
    expect(shouldLoadAdsenseScript(config)).toBe(true);
    expect(resolveMonetization("home-after-courses", {}, config)?.type).toBe("adsense");
    expect(html).toContain('class="adsbygoogle"');
    expect(html).toContain('data-ad-client="ca-pub-1234567890123456"');
    expect(html).toContain('data-ad-slot="1234567890"');
    expect(html).toContain('data-ad-format="auto"');
    expect(html).toContain('data-full-width-responsive="true"');
    expect(html).not.toContain("data-analytics-event");
  });

  it("never loads or renders AdSense when ID, approval, consent, or slot is missing", () => {
    const missingConsent = readyAdsenseConfig({ adsenseConsentReady: false });
    expect(shouldLoadAdsenseScript(monetizationConfig)).toBe(false);
    expect(shouldLoadAdsenseScript(missingConsent)).toBe(false);
    expect(resolveMonetization("home-after-courses", {}, missingConsent)?.type).toBe("house");
    const html = renderToStaticMarkup(createElement(MonetizationSlot, { placement: "home-after-courses", contentId: "home", config: missingConsent }));
    expect(html).toContain("広告募集中");
    expect(html).not.toContain("adsbygoogle");
  });

  it("keeps the required analytics event names without AdSense click interception", () => {
    expect(monetizationEvents).toEqual({
      adsense: { impression: "ad_impression", click: "ad_click" },
      sponsor: { impression: "sponsor_impression", click: "sponsor_click" },
      affiliate: { impression: "ad_impression", click: "affiliate_click" },
      house: { impression: "house_ad_impression", click: "house_ad_click" },
    });
  });
});
