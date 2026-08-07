import { businessContact, emailContactHref } from "@/content/business";

export function BusinessListingCta() {
  if (!businessContact) return <p className="business-contact-pending" role="status">現在利用できる掲載相談先がありません。</p>;
  const href = businessContact.kind === "email" ? emailContactHref("listing") : businessContact.href;
  return <a className="button button-secondary" href={href} target={businessContact.kind === "form" ? "_blank" : undefined} rel={businessContact.kind === "form" ? "noopener noreferrer" : undefined}
    data-analytics-event={businessContact.kind === "form" ? "contact_form_open" : "contact_cta_click"} data-analytics-secondary-event="business_cta_click" data-page-type="business" data-content-id="store-listing" data-contact-type="listing" data-placement="business-listing">
    Googleフォームで相談する{businessContact.kind === "form" ? " ↗" : ""}
  </a>;
}
