import { businessContact } from "@/content/business";

export function BusinessContactCta({ serviceType, placement, label = "掲載・制作について相談する" }: { serviceType?: string; placement: string; label?: string }) {
  if (!businessContact) return <p className="business-contact-pending" role="status">受付準備中</p>;
  return (
    <a className="button button-primary" href={businessContact.href} target={businessContact.kind === "form" ? "_blank" : undefined} rel={businessContact.kind === "form" ? "noreferrer" : undefined}
      data-analytics-event="business_cta_click" data-analytics-secondary-event="contact_intent" data-page-type="business" data-content-id="business-contact" data-service-type={serviceType ?? ""} data-placement={placement}>
      {label}{businessContact.kind === "form" ? " ↗" : ""}
    </a>
  );
}
