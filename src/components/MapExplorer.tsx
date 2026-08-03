"use client";

import Link from "next/link";
import { useState } from "react";
import { trackEvent } from "@/components/Analytics";
import { mapDirectionsUrl, mapExternalUrl } from "@/lib/maps";

type AreaChoice = { id: string; name: string; ward: string; lead: string; description: string; mapQuery: string; informationCheckedAt: string };
type CourseChoice = { id: string; areaId: string; title: string; summary: string; routeStops: { query: string }[] };
type SpotChoice = { id: string; areaId: string; name: string; mapQuery: string };

export function MapExplorer({ areaItems, courseItems, spotItems }: { areaItems: AreaChoice[]; courseItems: CourseChoice[]; spotItems: SpotChoice[] }) {
  const [selectedId, setSelectedId] = useState(areaItems[0]?.id ?? "");
  const area = areaItems.find((item) => item.id === selectedId) ?? areaItems[0];
  if (!area) return null;
  const relatedCourses = courseItems.filter((course) => course.areaId === area.id);
  const relatedSpots = spotItems.filter((spot) => spot.areaId === area.id);
  const representativeCourse = relatedCourses[0];
  const walkingUrl = representativeCourse ? mapDirectionsUrl(representativeCourse.routeStops.map((stop) => stop.query)) : mapExternalUrl(area.mapQuery);
  const disabledForMeasurement = process.env.NEXT_PUBLIC_DISABLE_MAP_IFRAMES === "1";

  function selectArea(id: string) {
    setSelectedId(id);
    trackEvent("map_area_select", { page_type: "map", content_id: id, area_id: id, route_segment: "", placement: "map-page-selector" });
  }

  return <section className="map-explorer" aria-label="エリア別おさんぽマップ">
    <div className="map-area-buttons" role="tablist" aria-label="エリアを選ぶ">
      {areaItems.map((item) => <button key={item.id} type="button" role="tab" aria-selected={item.id === area.id} onClick={() => selectArea(item.id)}>{item.name}</button>)}
    </div>
    <div className="map-explorer-grid">
      <section className="embedded-map map-explorer-map" aria-label={`${area.name}の地図`}>
        <div className="map-frame-shell">{disabledForMeasurement ? <div className="map-fallback" data-map-fallback="true"><strong>地図の表示をテスト用に無効化しています</strong><span>Googleマップで大きく開いて場所をご確認ください。</span></div> : <iframe className="map-frame" title={`${area.name}の地図`} loading="lazy" src={`https://www.google.com/maps?q=${encodeURIComponent(area.mapQuery)}&output=embed`} />}</div>
        <p className="map-note">地図は参考表示です。実際の通行状況はGoogleマップでご確認ください。</p>
      </section>
      <section className="map-area-summary" role="tabpanel">
        <p className="eyebrow">{area.ward}</p><h2>{area.name}</h2><p>{area.description}</p>
        <p className="map-check-date">情報確認日：{area.informationCheckedAt || "未記録"}</p>
        <div className="route-actions"><a className="button button-primary" href={mapExternalUrl(area.mapQuery)} target="_blank" rel="noopener noreferrer" data-analytics-event="google_map_click" data-page-type="map" data-content-id={area.id} data-area-id={area.id} data-placement="map-page">Googleマップで開く <span aria-hidden="true">↗</span></a><a className="button button-secondary" href={walkingUrl} target="_blank" rel="noopener noreferrer" data-analytics-event="walking_route_click" data-page-type="map" data-content-id={representativeCourse?.id ?? area.id} data-area-id={area.id} data-route-segment="whole" data-placement="map-page">徒歩ルートを開く <span aria-hidden="true">↗</span></a></div>
      </section>
    </div>
    <div className="map-related-grid"><section><h2>関連コース</h2>{relatedCourses.map((course) => <article className="map-related-card" key={course.id}><Link href={`/courses/${course.id}/`}>{course.title}</Link><p>{course.summary}</p></article>)}</section><section><h2>関連スポット</h2>{relatedSpots.map((spot) => <a className="map-related-card" key={spot.id} href={mapExternalUrl(spot.mapQuery)} target="_blank" rel="noopener noreferrer" data-analytics-event="map_spot_click" data-page-type="map" data-content-id={spot.id} data-area-id={area.id} data-placement="map-related-spots">{spot.name} <span aria-hidden="true">↗</span></a>)}</section></div>
  </section>;
}
