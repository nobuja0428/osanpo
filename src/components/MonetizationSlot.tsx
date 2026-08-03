import { revenueSlot, type RevenuePlacement, type RevenueSlot } from "@/content/monetization";

export function MonetizationSlot({ page, placement }: { page: RevenueSlot["page"]; placement: RevenuePlacement }) {
  const slot = revenueSlot(page, placement);
  if (!slot?.active || !slot.destination || !slot.label) return null;
  return <aside className="monetization-slot" aria-label={`${slot.disclosure}情報`}><p>{slot.disclosure}</p><a href={slot.destination} target="_blank" rel="sponsored noopener noreferrer" data-analytics-event={slot.trackingEvent} data-provider={slot.provider ?? ""} data-category={slot.category ?? ""} data-page-type={slot.page} data-content-id={slot.id} data-placement={slot.placement}>{slot.label}</a></aside>;
}
