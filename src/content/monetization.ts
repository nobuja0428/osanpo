export type RevenuePlacement = "after-course-summary" | "near-map-action" | "before-related-content" | "article-end" | "sidebar";

export type RevenueSlot = {
  id: string;
  page: "home" | "course" | "area" | "spot" | "story" | "event";
  placement: RevenuePlacement;
  active: boolean;
  disclosure: "広告" | "PR";
  trackingEvent: "affiliate_click";
  destination?: string;
  label?: string;
};

// No destination is supplied until an operator has approved a relevant partner link.
export const revenueSlots: RevenueSlot[] = [
  { id: "home-related-walk", page: "home", placement: "before-related-content", active: false, disclosure: "PR", trackingEvent: "affiliate_click" },
  { id: "course-map-action", page: "course", placement: "near-map-action", active: false, disclosure: "広告", trackingEvent: "affiliate_click" },
  { id: "area-sidebar", page: "area", placement: "sidebar", active: false, disclosure: "PR", trackingEvent: "affiliate_click" },
  { id: "spot-map-action", page: "spot", placement: "near-map-action", active: false, disclosure: "広告", trackingEvent: "affiliate_click" },
  { id: "story-end", page: "story", placement: "article-end", active: false, disclosure: "PR", trackingEvent: "affiliate_click" },
  { id: "event-sidebar", page: "event", placement: "sidebar", active: false, disclosure: "広告", trackingEvent: "affiliate_click" },
];

export function revenueSlot(page: RevenueSlot["page"], placement: RevenuePlacement) {
  return revenueSlots.find((slot) => slot.page === page && slot.placement === placement);
}
