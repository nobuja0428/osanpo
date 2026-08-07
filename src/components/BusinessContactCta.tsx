import { businessContact, emailContactHref, type ContactSubjectKey } from "@/content/business";

export function BusinessContactCta({ serviceType, placement, label = "Googleフォームで相談する" }: { serviceType?: string; placement: string; label?: string }) {
  if (!businessContact) return <p className="business-contact-pending" role="status">現在利用できる問い合わせ先がありません。</p>;
  const contactType: ContactSubjectKey = serviceType === "website" ? "website" : serviceType === "support" ? "support" : serviceType === "store-page" || serviceType === "map-guidance" ? "listing" : "general";
  const href = businessContact.kind === "email" ? emailContactHref(contactType) : businessContact.href;
  return (
    <a className="button button-primary" href={href} target={businessContact.kind === "form" ? "_blank" : undefined} rel={businessContact.kind === "form" ? "noopener noreferrer" : undefined}
      data-analytics-event={businessContact.kind === "form" ? "contact_form_open" : "contact_cta_click"} data-analytics-secondary-event="business_cta_click" data-page-type="business" data-content-id="business-contact" data-contact-type={contactType} data-placement={placement}>
      {label}{businessContact.kind === "form" ? " ↗" : ""}
    </a>
  );
}
