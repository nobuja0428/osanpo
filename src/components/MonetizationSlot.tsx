import Link from "next/link";
import { AdSenseSlot } from "@/components/AdSenseSlot";
import {
  houseAdForPlacement,
  monetizationConfig,
  monetizationEvents,
  resolveMonetization,
  type HouseAdConfig,
  type MonetizationConfig,
  type MonetizationPlacement,
} from "@/content/monetization";

type MonetizationSlotProps = {
  placement: MonetizationPlacement;
  contentId: string;
  areaId?: string;
  config?: MonetizationConfig;
  now?: Date;
};

const pageTypeByPlacement: Record<MonetizationPlacement, string> = {
  "home-after-courses": "home",
  "courses-after-grid": "courses",
  "course-detail-after-info": "course",
  "area-detail-after-courses": "area",
  "spot-detail-end": "spot",
  "story-middle": "story",
  "story-end": "story",
};

type HouseAdSlotProps = {
  item: HouseAdConfig;
  placement: MonetizationPlacement;
  contentId: string;
  areaId?: string;
};

function HouseAdSlot({ item, placement, contentId, areaId }: HouseAdSlotProps) {
  const pageType = pageTypeByPlacement[placement];
  return (
    <aside
      className="monetization-slot monetization-slot-house"
      aria-label={item.label}
      data-monetization-impression={monetizationEvents.house.impression}
      data-ad-type="house"
      data-page-type={pageType}
      data-content-id={contentId}
      data-area-id={areaId ?? ""}
      data-placement={placement}
      data-slot-status="recruiting"
      data-slot-format="responsive"
    >
      <span className="monetization-label">{item.label}</span>
      <div className="monetization-recruitment-mark" aria-hidden="true">
        <span>AD SPACE</span>
        <strong>地域スポンサー枠</strong>
        <small>広告掲載後に差し替え</small>
      </div>
      <div className="monetization-copy">
        <p className="monetization-title">{item.headline}</p>
        <p>{item.description}</p>
        <div className="monetization-house-actions">
          <a
            className="button button-accent monetization-cta"
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${item.ctaLabel}（新しいタブで開く）`}
            data-analytics-event={monetizationEvents.house.click}
            data-analytics-secondary-event="sponsor_contact_click"
            data-ad-type="house"
            data-page-type={pageType}
            data-content-id={contentId}
            data-area-id={areaId ?? ""}
            data-placement={placement}
            data-contact-type="sponsor"
          >
            {item.ctaLabel} <span aria-hidden="true">↗</span>
          </a>
          <Link
            className="monetization-details-link"
            href="/advertise/"
            data-analytics-event={monetizationEvents.house.click}
            data-ad-type="house"
            data-page-type={pageType}
            data-content-id={contentId}
            data-area-id={areaId ?? ""}
            data-placement={placement}
            data-contact-type="advertise-details"
          >
            広告枠・掲載内容を見る <span aria-hidden="true">→</span>
          </Link>
          <small>{item.footnote}</small>
        </div>
      </div>
    </aside>
  );
}

export function MonetizationSlot({
  placement,
  contentId,
  areaId,
  config = monetizationConfig,
  now,
}: MonetizationSlotProps) {
  const resolved = resolveMonetization(placement, { areaId, contentId, now }, config);
  if (!resolved) return null;

  if (resolved.type === "house") {
    return <HouseAdSlot item={resolved.item} placement={placement} contentId={contentId} areaId={areaId} />;
  }

  if (resolved.type === "adsense") {
    const houseFallback = houseAdForPlacement(placement, config);
    return (
      <AdSenseSlot
        publisherId={resolved.publisherId}
        slot={resolved.slot}
        placement={placement}
        fallback={houseFallback ? <HouseAdSlot item={houseFallback.item} placement={placement} contentId={contentId} areaId={areaId} /> : null}
      />
    );
  }

  const sponsorItem = resolved.type === "sponsor" ? resolved.item : null;
  const affiliateItem = resolved.type === "affiliate" ? resolved.item : null;
  const item = sponsorItem ?? affiliateItem!;
  const sponsorId = sponsorItem?.id ?? "";
  const impressionEvent = monetizationEvents[resolved.type].impression;
  const clickEvent = monetizationEvents[resolved.type].click;
  const disclosure = resolved.type === "sponsor" ? "スポンサー" : "広告";
  const title = sponsorItem?.name ?? affiliateItem!.label;
  const description = item.description;
  const startAt = item.startAt ?? "";
  const endAt = item.endAt ?? "";
  const pageType = pageTypeByPlacement[placement];

  return (
    <aside
      className={`monetization-slot monetization-slot-${resolved.type}`}
      aria-label={`${disclosure}情報`}
      data-monetization-impression={impressionEvent}
      data-ad-type={resolved.type}
      data-sponsor-id={sponsorId}
      data-page-type={pageType}
      data-content-id={contentId}
      data-area-id={areaId ?? ""}
      data-placement={placement}
      data-start-at={startAt}
      data-end-at={endAt}
    >
      <span className="monetization-label">{disclosure}</span>
      {sponsorItem?.image ? (
        // Sponsor images are operator-provided assets; explicit dimensions prevent layout shift.
        // eslint-disable-next-line @next/next/no-img-element
        <img className="monetization-image" src={sponsorItem.image} alt={sponsorItem.imageAlt ?? `${sponsorItem.name}の広告画像`} width="320" height="180" loading="lazy" decoding="async" />
      ) : null}
      <div className="monetization-copy">
        <p className="monetization-title">{title}</p>
        {sponsorItem ? <p className="monetization-headline">{sponsorItem.headline}</p> : null}
        {description ? <p>{description}</p> : null}
        <a
          className="button button-secondary monetization-cta"
          href={item.href}
          target="_blank"
          rel="noopener noreferrer sponsored"
          data-analytics-event={clickEvent}
          data-ad-type={resolved.type}
          data-sponsor-id={sponsorId}
          data-page-type={pageType}
          data-content-id={contentId}
          data-area-id={areaId ?? ""}
          data-placement={placement}
        >
          詳しく見る <span aria-hidden="true">↗</span>
        </a>
      </div>
    </aside>
  );
}
