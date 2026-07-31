import { revenueSlot, type RevenuePlacement, type RevenueSlot } from "@/content/monetization";

export function MonetizationSlot({ page, placement }: { page: RevenueSlot["page"]; placement: RevenuePlacement }) {
  const slot = revenueSlot(page, placement);
  if (!slot?.active || !slot.destination || !slot.label) return null;
  return <aside className="monetization-slot" aria-label={`${slot.disclosure}情報`}><p>{slot.disclosure}</p><a href={slot.destination} data-analytics-event={slot.trackingEvent}>{slot.label}</a></aside>;
}
