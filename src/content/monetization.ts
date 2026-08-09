export type MonetizationType = "adsense" | "sponsor" | "affiliate";

export const monetizationEvents = {
  adsense: { impression: "ad_impression", click: "ad_click" },
  sponsor: { impression: "sponsor_impression", click: "sponsor_click" },
  affiliate: { impression: "ad_impression", click: "affiliate_click" },
} as const;

export type MonetizationPlacement =
  | "home-after-courses"
  | "courses-after-grid"
  | "course-detail-after-info"
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
  startAt?: string;
  endAt?: string;
  active: boolean;
};

export type AdsenseSlotConfig = {
  slotId: string;
  format: string;
};

export type MonetizationConfig = {
  enabled: boolean;
  adsenseEnabled: boolean;
  sponsorEnabled: boolean;
  affiliateEnabled: boolean;
  placements: Record<MonetizationPlacement, boolean>;
  adsense: {
    publisherId: string;
    slots: Record<MonetizationPlacement, AdsenseSlotConfig>;
  };
  sponsors: SponsorAd[];
  affiliates: AffiliatePlacement[];
};

const emptyAdsenseSlot = (): AdsenseSlotConfig => ({ slotId: "", format: "" });

// Production defaults are intentionally empty and disabled. Enabling a placement alone
// never renders anything without an approved, active item and its required values.
export const monetizationConfig: MonetizationConfig = {
  enabled: false,
  adsenseEnabled: false,
  sponsorEnabled: false,
  affiliateEnabled: false,
  placements: {
    "home-after-courses": false,
    "courses-after-grid": false,
    "course-detail-after-info": false,
    "story-middle": false,
    "story-end": false,
  },
  adsense: {
    publisherId: "",
    slots: {
      "home-after-courses": emptyAdsenseSlot(),
      "courses-after-grid": emptyAdsenseSlot(),
      "course-detail-after-info": emptyAdsenseSlot(),
      "story-middle": emptyAdsenseSlot(),
      "story-end": emptyAdsenseSlot(),
    },
  },
  sponsors: [],
  affiliates: [],
};

export type ResolvedSponsor = { type: "sponsor"; item: SponsorAd };
export type ResolvedAffiliate = { type: "affiliate"; item: AffiliatePlacement };
export type ResolvedAdsense = { type: "adsense"; publisherId: string; slot: AdsenseSlotConfig };
export type ResolvedMonetization = ResolvedSponsor | ResolvedAffiliate | ResolvedAdsense;

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

export function resolveMonetization(
  placement: MonetizationPlacement,
  options: { areaId?: string; now?: Date } = {},
  config: MonetizationConfig = monetizationConfig,
): ResolvedMonetization | null {
  if (!config.enabled || !config.placements[placement]) return null;
  const now = options.now ?? new Date();

  if (config.sponsorEnabled) {
    const sponsor = config.sponsors.find((item) =>
      item.active
      && item.placements.includes(placement)
      && areaMatches(item.areaId, options.areaId)
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
      && isWithinPublicationWindow(item.startAt, item.endAt, now)
      && Boolean(item.label.trim() && item.href.trim()),
    );
    if (affiliate) return { type: "affiliate", item: affiliate };
  }

  if (config.adsenseEnabled) {
    const slot = config.adsense.slots[placement];
    if (config.adsense.publisherId.trim() && slot.slotId.trim() && slot.format.trim()) {
      return { type: "adsense", publisherId: config.adsense.publisherId, slot };
    }
  }

  return null;
}
