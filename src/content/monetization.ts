import { businessContactFormUrl } from "@/content/business";
import inventory from "@/content/monetization-inventory.json";
import { validateMonetizationInventory } from "../lib/monetization-validation.mjs";

export type MonetizationType = "adsense" | "sponsor" | "affiliate" | "house";

export const monetizationEvents = {
  // ad_click remains part of the shared event vocabulary, but AdSenseSlot never
  // attaches it to Google's iframe or intercepts AdSense clicks.
  adsense: { impression: "ad_impression", click: "ad_click" },
  sponsor: { impression: "sponsor_impression", click: "sponsor_click" },
  affiliate: { impression: "ad_impression", click: "affiliate_click" },
  house: { impression: "house_ad_impression", click: "house_ad_click" },
} as const;

export type MonetizationPlacement =
  | "home-after-courses"
  | "courses-after-grid"
  | "course-detail-after-info"
  | "area-detail-after-courses"
  | "spot-detail-end"
  | "story-middle"
  | "story-end";

export type SponsorAd = {
  id: string;
  name: string;
  headline: string;
  description?: string;
  image?: string;
  imageAlt?: string;
  href: string;
  placements: MonetizationPlacement[];
  areaId?: string;
  contentId?: string;
  scopeType?: "site" | "area" | "course" | "story";
  startAt?: string;
  endAt?: string;
  active: boolean;
};

export type AffiliatePlacement = {
  id: string;
  label: string;
  description?: string;
  href: string;
  placements: MonetizationPlacement[];
  areaId?: string;
  contentId?: string;
  startAt?: string;
  endAt?: string;
  active: boolean;
};

export type AdsenseSlotConfig = {
  slotId: string;
  format: string;
};

export type HouseAdConfig = {
  label: string;
  headline: string;
  description: string;
  ctaLabel: string;
  footnote: string;
  href: string;
};

export type MonetizationConfig = {
  enabled: boolean;
  adsenseEnabled: boolean;
  adsenseProductionReady: boolean;
  adsenseConsentReady: boolean;
  sponsorEnabled: boolean;
  affiliateEnabled: boolean;
  houseAdsEnabled: boolean;
  placements: Record<MonetizationPlacement, boolean>;
  housePlacements: Record<MonetizationPlacement, boolean>;
  adsense: {
    publisherId: string;
    slots: Record<MonetizationPlacement, AdsenseSlotConfig>;
  };
  houseAd: HouseAdConfig;
  sponsors: SponsorAd[];
  affiliates: AffiliatePlacement[];
};

const emptyAdsenseSlot = (): AdsenseSlotConfig => ({ slotId: "", format: "" });

// House Ads are the only production ads enabled in this release. Real sponsors,
// affiliate links, AdSense IDs and AdSense readiness flags intentionally remain empty/off.
export const monetizationConfig: MonetizationConfig = {
  enabled: true,
  adsenseEnabled: false,
  adsenseProductionReady: false,
  adsenseConsentReady: false,
  sponsorEnabled: false,
  affiliateEnabled: false,
  houseAdsEnabled: true,
  placements: {
    "home-after-courses": true,
    "courses-after-grid": true,
    "course-detail-after-info": true,
    "area-detail-after-courses": true,
    "spot-detail-end": true,
    "story-middle": true,
    "story-end": true,
  },
  housePlacements: {
    "home-after-courses": true,
    "courses-after-grid": true,
    "course-detail-after-info": true,
    "area-detail-after-courses": true,
    "spot-detail-end": true,
    "story-middle": false,
    "story-end": true,
  },
  adsense: {
    publisherId: "",
    slots: {
      "home-after-courses": emptyAdsenseSlot(),
      "courses-after-grid": emptyAdsenseSlot(),
      "course-detail-after-info": emptyAdsenseSlot(),
      "area-detail-after-courses": emptyAdsenseSlot(),
      "spot-detail-end": emptyAdsenseSlot(),
      "story-middle": emptyAdsenseSlot(),
      "story-end": emptyAdsenseSlot(),
    },
  },
  houseAd: {
    label: "広告掲載・スポンサー募集",
    headline: "この街を歩く人に、お店の魅力を。",
    description: "高円寺・吉祥寺・浅草を中心に、地域のお店・商品・サービスの掲載相談を受け付けています。",
    ctaLabel: "広告掲載を相談する",
    footnote: "掲載内容・期間・料金は個別にご案内します。成果・来店数・売上等を保証するものではありません。実広告は「広告」または「スポンサー」と明示します。",
    href: businessContactFormUrl,
  },
  sponsors: inventory.sponsors as SponsorAd[],
  affiliates: inventory.affiliates as AffiliatePlacement[],
};

export type ResolvedSponsor = { type: "sponsor"; item: SponsorAd };
export type ResolvedAffiliate = { type: "affiliate"; item: AffiliatePlacement };
export type ResolvedAdsense = { type: "adsense"; publisherId: string; slot: AdsenseSlotConfig };
export type ResolvedHouse = { type: "house"; item: HouseAdConfig };
export type ResolvedMonetization = ResolvedSponsor | ResolvedAffiliate | ResolvedAdsense | ResolvedHouse;

function validDate(value: string | undefined) {
  if (!value) return undefined;
  const time = Date.parse(value);
  return Number.isFinite(time) ? time : undefined;
}

export function isWithinPublicationWindow(startAt: string | undefined, endAt: string | undefined, now = new Date()) {
  const current = now.getTime();
  const start = validDate(startAt);
  const end = validDate(endAt);
  if (startAt && start === undefined) return false;
  if (endAt && end === undefined) return false;
  return (start === undefined || current >= start) && (end === undefined || current <= end);
}

function areaMatches(itemAreaId: string | undefined, pageAreaId: string | undefined) {
  return !itemAreaId || itemAreaId === pageAreaId;
}

function contentMatches(itemContentId: string | undefined, pageContentId: string | undefined) {
  return !itemContentId || itemContentId === pageContentId;
}

export type MonetizationConfigIssue = { level: "error" | "warning"; code: string; message: string };

export function validateMonetizationConfig(config: MonetizationConfig, now = new Date()): MonetizationConfigIssue[] {
  const pageTypeByPlacement: Record<MonetizationPlacement, string> = {
    "home-after-courses": "home", "courses-after-grid": "courses", "course-detail-after-info": "course",
    "area-detail-after-courses": "area", "spot-detail-end": "spot", "story-middle": "story", "story-end": "story",
  };
  return validateMonetizationInventory({ sponsors: config.sponsors, affiliates: config.affiliates, housePlacements: config.housePlacements, pageTypeByPlacement }, now) as MonetizationConfigIssue[];
}

export function validAdsensePublisherId(value: string) {
  return /^ca-pub-\d{16}$/.test(value.trim());
}

export function validAdsenseSlot(slot: AdsenseSlotConfig) {
  return /^\d+$/.test(slot.slotId.trim()) && slot.format.trim().length > 0;
}

export function adsensePlacementIsReady(config: MonetizationConfig, placement: MonetizationPlacement) {
  return config.enabled
    && config.adsenseEnabled
    && config.adsenseProductionReady
    && config.adsenseConsentReady
    && config.placements[placement]
    && validAdsensePublisherId(config.adsense.publisherId)
    && validAdsenseSlot(config.adsense.slots[placement]);
}

export function shouldLoadAdsenseScript(config: MonetizationConfig = monetizationConfig) {
  return validAdsensePublisherId(config.adsense.publisherId)
    && Object.keys(config.placements).some((placement) => adsensePlacementIsReady(config, placement as MonetizationPlacement));
}

export function houseAdForPlacement(
  placement: MonetizationPlacement,
  config: MonetizationConfig = monetizationConfig,
): ResolvedHouse | null {
  const item = config.houseAd;
  if (!config.enabled || !config.placements[placement] || !config.houseAdsEnabled || !config.housePlacements[placement]) return null;
  if (!item.label.trim() || !item.headline.trim() || !item.description.trim() || !item.ctaLabel.trim() || !item.href.trim()) return null;
  return { type: "house", item };
}

export function resolveMonetization(
  placement: MonetizationPlacement,
  options: { areaId?: string; contentId?: string; now?: Date } = {},
  config: MonetizationConfig = monetizationConfig,
): ResolvedMonetization | null {
  if (!config.enabled || !config.placements[placement]) return null;
  const now = options.now ?? new Date();

  if (config.sponsorEnabled) {
    const sponsor = config.sponsors.find((item) =>
      item.active
      && item.placements.includes(placement)
      && areaMatches(item.areaId, options.areaId)
      && contentMatches(item.contentId, options.contentId)
      && isWithinPublicationWindow(item.startAt, item.endAt, now)
      && Boolean(item.name.trim() && item.headline.trim() && item.href.trim()),
    );
    if (sponsor) return { type: "sponsor", item: sponsor };
  }

  if (config.affiliateEnabled) {
    const affiliate = config.affiliates.find((item) =>
      item.active
      && item.placements.includes(placement)
      && areaMatches(item.areaId, options.areaId)
      && contentMatches(item.contentId, options.contentId)
      && isWithinPublicationWindow(item.startAt, item.endAt, now)
      && Boolean(item.label.trim() && item.href.trim()),
    );
    if (affiliate) return { type: "affiliate", item: affiliate };
  }

  if (adsensePlacementIsReady(config, placement)) {
    return { type: "adsense", publisherId: config.adsense.publisherId, slot: config.adsense.slots[placement] };
  }

  return houseAdForPlacement(placement, config);
}
