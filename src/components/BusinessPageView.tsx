"use client";

import { useEffect } from "react";
import { trackEvent } from "@/components/Analytics";

export function BusinessPageView({ contentId, serviceType = "", eventName }: { contentId: string; serviceType?: string; eventName?: "service_view" | "pricing_view" | "example_view" }) {
  useEffect(() => {
    trackEvent("business_page_view", { page_type: "business", content_id: contentId, service_type: serviceType, placement: "page" });
    if (eventName) trackEvent(eventName, { page_type: "business", content_id: contentId, service_type: serviceType, placement: "page" });
  }, [contentId, eventName, serviceType]);
  return null;
}
