"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { AdsenseSlotConfig, MonetizationPlacement } from "@/content/monetization";

declare global {
  interface Window {
    adsbygoogle?: Record<string, unknown>[];
  }
}

type AdSenseSlotProps = {
  publisherId: string;
  slot: AdsenseSlotConfig;
  placement: MonetizationPlacement;
  fallback?: ReactNode;
};

export function AdSenseSlot({ publisherId, slot, placement, fallback = null }: AdSenseSlotProps) {
  const adRef = useRef<HTMLModElement>(null);
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    const ad = adRef.current;
    if (!ad) return;

    const activateFallback = () => setShowFallback(true);
    const statusObserver = new MutationObserver(() => {
      const status = ad.dataset.adStatus;
      if (status === "unfilled") activateFallback();
    });
    statusObserver.observe(ad, { attributes: true, attributeFilter: ["data-ad-status"] });
    window.addEventListener("osanpo:adsense-error", activateFallback);

    const timeout = window.setTimeout(() => {
      if (ad.dataset.adStatus !== "filled") activateFallback();
    }, 8_000);

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      activateFallback();
    }

    return () => {
      window.clearTimeout(timeout);
      statusObserver.disconnect();
      window.removeEventListener("osanpo:adsense-error", activateFallback);
    };
  }, []);

  if (showFallback) return fallback;

  return (
    <aside className="monetization-slot monetization-slot-adsense" aria-label="広告情報" data-placement={placement}>
      <span className="monetization-label">広告</span>
      <div className="monetization-adsense-frame">
        <ins
          ref={adRef}
          className="adsbygoogle"
          aria-label="Google AdSense広告"
          style={{ display: "block" }}
          data-ad-client={publisherId}
          data-ad-slot={slot.slotId}
          data-ad-format={slot.format}
          data-full-width-responsive="true"
        />
      </div>
    </aside>
  );
}
