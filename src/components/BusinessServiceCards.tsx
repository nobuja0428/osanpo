import Link from "next/link";
import { businessServices } from "@/content/business";

export function BusinessServiceCards() {
  return <div className="business-card-grid">{businessServices.map((service) => <article className="business-card" key={service.id}>
    <p className="eyebrow">SERVICE</p><h3>{service.title}</h3><p>{service.description}</p><strong className="business-price">{service.price}</strong><p className="business-price-note">{service.priceNote}</p>
    <Link href={service.href} className="text-link" data-analytics-event="service_view" data-page-type="business" data-content-id={service.id} data-service-type={service.id} data-placement="business-service-list">詳しく見る →</Link>
  </article>)}</div>;
}
