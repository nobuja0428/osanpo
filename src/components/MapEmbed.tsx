"use client";

import { useEffect, useState } from "react";
import { mapExternalUrl } from "@/lib/maps";

type MapEmbedProps = {
  query: string;
  title: string;
  contentId: string;
  areaId?: string;
  placement: string;
  className?: string;
};

export function MapEmbed({ query, title, contentId, areaId = "", placement, className = "" }: MapEmbedProps) {
  const [temporarilyHidden, setTemporarilyHidden] = useState(false);
  const disabledForMeasurement = process.env.NEXT_PUBLIC_DISABLE_MAP_IFRAMES === "1";
  useEffect(() => {
    const hide = () => setTemporarilyHidden(true);
    const show = () => setTemporarilyHidden(false);
    window.addEventListener("osanpo:course-map-open", hide);
    window.addEventListener("osanpo:course-map-close", show);
    return () => {
      window.removeEventListener("osanpo:course-map-open", hide);
      window.removeEventListener("osanpo:course-map-close", show);
    };
  }, []);
  return <section className={`embedded-map ${className}`.trim()} aria-label={title}>
    <div className="map-frame-shell">
      {disabledForMeasurement || temporarilyHidden ? <div className="map-fallback" data-map-fallback="true"><strong>{temporarilyHidden ? "選択したコースの地図を表示しています" : "地図の表示をテスト用に無効化しています"}</strong><span>{temporarilyHidden ? "コース地図を閉じると、この地図へ戻ります。" : "Googleマップで大きく開いて場所をご確認ください。"}</span></div> : <iframe className="map-frame" title={title} loading="lazy" src={`https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`} />}
    </div>
    <p className="map-note">地図は参考表示です。実際の通行状況・営業時間・経路はGoogleマップと公式情報でご確認ください。</p>
    <a className="external-text-link" href={mapExternalUrl(query)} target="_blank" rel="noopener noreferrer" data-analytics-event="google_map_click" data-page-type="map" data-content-id={contentId} data-area-id={areaId} data-placement={placement}>Googleマップで大きく開く <span aria-hidden="true">↗</span></a>
  </section>;
}
