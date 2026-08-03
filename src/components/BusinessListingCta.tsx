import { businessContact, businessListingApplicationEnabled } from "@/content/business";

export function BusinessListingCta() {
  if (!businessListingApplicationEnabled || !businessContact) return <p className="business-contact-pending" role="status">掲載申請は準備中</p>;
  return <a className="button button-secondary" href={businessContact.href} target={businessContact.kind === "form" ? "_blank" : undefined} rel={businessContact.kind === "form" ? "noreferrer" : undefined}
    data-analytics-event="store_listing_interest" data-analytics-secondary-event="contact_intent" data-page-type="business" data-content-id="store-listing" data-service-type="store-listing" data-placement="business-listing">
    無料掲載について相談する{businessContact.kind === "form" ? " ↗" : ""}
  </a>;
}
