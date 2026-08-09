import {
  monetizationConfig,
  monetizationEvents,
  resolveMonetization,
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

export function MonetizationSlot({
  placement,
  contentId,
  areaId,
  config = monetizationConfig,
  now,
}: MonetizationSlotProps) {
  const resolved = resolveMonetization(placement, { areaId, now }, config);
  if (!resolved) return null;

  // AdSense script and ad-unit rendering are deliberately excluded from this release.
  // The resolved configuration keeps future Google-specific work inside this component.
  if (resolved.type === "adsense") return null;

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

  return (
    <aside
      className={`monetization-slot monetization-slot-${resolved.type}`}
      aria-label={`${disclosure}情報`}
      data-monetization-impression={impressionEvent}
      data-ad-type={resolved.type}
      data-sponsor-id={sponsorId}
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
