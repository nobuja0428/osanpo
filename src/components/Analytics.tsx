"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim().toUpperCase() ?? "";
const enabled = /^G-[A-Z0-9]+$/.test(measurementId);

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const allowedParameterNames = new Set([
  "content_id", "page_type", "area_id", "route_segment", "placement", "contact_type",
  "duration_range", "budget_range", "audience_type", "mood_type", "result_count", "selected_stop_count",
  "filter_name", "selected_filter_count", "active",
]);

export function trackEvent(name: string, parameters: Record<string, string | number | boolean> = {}) {
  if (!enabled || !window.gtag || !/^[a-z][a-z0-9_]{0,39}$/.test(name)) return false;
  const safeParameters = Object.fromEntries(Object.entries(parameters).filter(([key]) => allowedParameterNames.has(key)));
  window.gtag("event", name, safeParameters);
  return true;
}

export function Analytics() {
  const pathname = usePathname();
  const lastPath = useRef("");

  useEffect(() => {
    if (!enabled || !window.gtag || !pathname || lastPath.current === pathname) return;
    lastPath.current = pathname;
    window.gtag("event", "page_view", {
      page_path: pathname,
      page_title: document.title,
      page_location: window.location.href.split("#")[0],
    });
  }, [pathname]);

  if (!enabled) return null;

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`} strategy="afterInteractive" />
      <Script id="osanpo-ga4" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];window.gtag=function(){dataLayer.push(arguments)};window.gtag('js',new Date());window.gtag('config','${measurementId}',{send_page_view:false,allow_google_signals:false,allow_ad_personalization_signals:false});`}
      </Script>
    </>
  );
}
