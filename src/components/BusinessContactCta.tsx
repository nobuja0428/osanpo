import { businessContact, emailContactHref, type ContactSubjectKey } from "@/content/business";

export function BusinessContactCta({ serviceType, placement, label = "掲載・制作について相談する" }: { serviceType?: string; placement: string; label?: string }) {
  if (!businessContact) return <p className="business-contact-pending" role="status">受付準備中</p>;
  const contactType: ContactSubjectKey = serviceType === "website" ? "website" : serviceType === "support" ? "support" : serviceType === "store-page" || serviceType === "map-guidance" ? "listing" : "general";
  const href = businessContact.kind === "email" ? emailContactHref(contactType) : businessContact.href;
  return (
    <a className="button button-primary" href={href} target={businessContact.kind === "form" ? "_blank" : undefined} rel={businessContact.kind === "form" ? "noreferrer" : undefined}
      data-analytics-event="business_cta_click" data-analytics-secondary-event="contact_cta_click" data-page-type="business" data-content-id="business-contact" data-contact-type={contactType} data-placement={placement}>
      {label}{businessContact.kind === "form" ? " ↗" : ""}
    </a>
  );
}
