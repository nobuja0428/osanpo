import { businessContact, emailContactHref } from "@/content/business";

export function BusinessListingCta() {
  if (!businessContact) return <p className="business-contact-pending" role="status">掲載相談は準備中</p>;
  const href = businessContact.kind === "email" ? emailContactHref("listing") : businessContact.href;
  return <a className="button button-secondary" href={href} target={businessContact.kind === "form" ? "_blank" : undefined} rel={businessContact.kind === "form" ? "noreferrer" : undefined}
    data-analytics-event="business_cta_click" data-analytics-secondary-event="contact_cta_click" data-page-type="business" data-content-id="store-listing" data-contact-type="listing" data-placement="business-listing">
    店舗掲載について相談する{businessContact.kind === "form" ? " ↗" : ""}
  </a>;
}
