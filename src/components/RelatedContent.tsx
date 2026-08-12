import Link from "next/link";

export type RelatedContentItem = {
  href: string;
  eyebrow: string;
  title: string;
  description: string;
  contentId: string;
  areaId?: string;
};

export function RelatedContent({
  eyebrow,
  title,
  intro,
  items,
  pageType,
  placement,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  items: readonly RelatedContentItem[];
  pageType: string;
  placement: string;
}) {
  if (!items.length) return null;

  return (
    <section className="related-content" aria-labelledby={`${placement}-heading`}>
      <div className="section-heading related-content-heading">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h2 id={`${placement}-heading`}>{title}</h2>
          {intro ? <p>{intro}</p> : null}
        </div>
      </div>
      <div className="related-content-grid">
        {items.slice(0, 3).map((item) => (
          <Link
            className="related-content-link"
            href={item.href}
            key={`${item.href}-${item.contentId}`}
            data-analytics-event="related_content_click"
            data-page-type={pageType}
            data-content-id={item.contentId}
            data-area-id={item.areaId ?? ""}
            data-placement={placement}
          >
            <span className="eyebrow">{item.eyebrow}</span>
            <strong>{item.title}</strong>
            <span>{item.description}</span>
            <span className="related-content-action">詳しく見る <span aria-hidden="true">→</span></span>
          </Link>
        ))}
      </div>
    </section>
  );
}
