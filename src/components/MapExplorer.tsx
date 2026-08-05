"use client";

import Link from "next/link";
import { useState } from "react";
import { trackEvent } from "@/components/Analytics";
import { CourseCard } from "@/components/Cards";
import type { Course } from "@/lib/content";
import { courseRouteQueries, mapDirectionsUrl, mapExternalUrl } from "@/lib/maps";

type AreaChoice = { id: string; name: string; ward: string; lead: string; description: string; mapQuery: string; informationCheckedAt: string };
type SpotChoice = { id: string; areaId: string; name: string; mapQuery: string };

export function MapExplorer({ areaItems, courseItems, spotItems }: { areaItems: AreaChoice[]; courseItems: Course[]; spotItems: SpotChoice[] }) {
  const [selectedId, setSelectedId] = useState(areaItems[0]?.id ?? "");
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const area = areaItems.find((item) => item.id === selectedId) ?? areaItems[0];
  if (!area) return null;
  const relatedCourses = courseItems.filter((course) => course.areaId === area.id);
  const relatedSpots = spotItems.filter((spot) => spot.areaId === area.id);
  const selectedCourse = relatedCourses.find((course) => course.id === selectedCourseId);
  const representativeCourse = selectedCourse ?? relatedCourses[0];
  const courseQueries = selectedCourse ? courseRouteQueries(selectedCourse.routeStops) : [];
  const mapQuery = selectedCourse ? courseQueries.join(" ") : area.mapQuery;
  const mapTitle = selectedCourse ? `${selectedCourse.title}の地図` : `${area.name}の地図`;
  const walkingUrl = representativeCourse ? mapDirectionsUrl(courseRouteQueries(representativeCourse.routeStops)) : mapExternalUrl(area.mapQuery);
  const disabledForMeasurement = process.env.NEXT_PUBLIC_DISABLE_MAP_IFRAMES === "1";

  function selectArea(id: string) {
    setSelectedId(id);
    setSelectedCourseId("");
    trackEvent("map_area_select", { page_type: "map", content_id: id, area_id: id, route_segment: "", placement: "map-page-selector" });
  }

  function selectCourse(id: string) {
    setSelectedCourseId(id);
    const course = courseItems.find((item) => item.id === id);
    trackEvent("course_map_open", { page_type: "map", content_id: id, area_id: course?.areaId ?? "", placement: "map-related-courses" });
  }

  function closeCourseMap() {
    if (selectedCourse) trackEvent("course_map_close", { page_type: "map", content_id: selectedCourse.id, area_id: selectedCourse.areaId, placement: "map-related-courses" });
    setSelectedCourseId("");
  }

  return <section className="map-explorer" aria-label="エリア別おさんぽマップ">
    <div className="map-area-buttons" role="tablist" aria-label="エリアを選ぶ">
      {areaItems.map((item) => <button key={item.id} type="button" role="tab" aria-selected={item.id === area.id} onClick={() => selectArea(item.id)}>{item.name}</button>)}
    </div>
    <div className="map-explorer-grid">
      <section className="embedded-map map-explorer-map" aria-label={mapTitle}>
        <div className="map-frame-shell">{disabledForMeasurement ? <div className="map-fallback" data-map-fallback="true"><strong>地図の表示をテスト用に無効化しています</strong><span>Googleマップで大きく開いて場所をご確認ください。</span></div> : <iframe key={mapQuery} className="map-frame" title={mapTitle} loading="lazy" src={`https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`} />}</div>
        <p className="map-note">地図は参考表示です。実際の通行状況はGoogleマップでご確認ください。</p>
      </section>
      <section className="map-area-summary" role="tabpanel">
        {selectedCourse ? <><p className="eyebrow">{area.name}・COURSE MAP</p><h2>{selectedCourse.title}</h2><div className="course-map-drawer-route"><p><span className="route-label is-start">START</span><strong>{selectedCourse.routeStops[0]?.name}</strong></p><p><span className="route-label is-goal">GOAL</span><strong>{selectedCourse.routeStops[selectedCourse.routeStops.length - 1]?.name}</strong></p></div><p>主な立ち寄り地点：{selectedCourse.routeStops.slice(1, -1).map((stop) => stop.name).join("・")}</p></> : <><p className="eyebrow">{area.ward}</p><h2>{area.name}</h2><p>{area.description}</p><p className="map-check-date">情報確認日：{area.informationCheckedAt || "未記録"}</p></>}
        <div className="route-actions"><a className="button button-primary" href={mapExternalUrl(mapQuery)} target="_blank" rel="noopener noreferrer" data-analytics-event="google_map_click" data-page-type="map" data-content-id={selectedCourse?.id ?? area.id} data-area-id={area.id} data-placement="map-page">Googleマップで開く <span aria-hidden="true">↗</span></a><a className="button button-secondary" href={walkingUrl} target="_blank" rel="noopener noreferrer" data-analytics-event="walking_route_click" data-page-type="map" data-content-id={representativeCourse?.id ?? area.id} data-area-id={area.id} data-route-segment="whole" data-placement="map-page">徒歩ルートを開く <span aria-hidden="true">↗</span></a>{selectedCourse ? <><Link className="button button-secondary" href={`/courses/${selectedCourse.id}/`}>コース詳細を見る</Link><button className="map-close-button" type="button" onClick={closeCourseMap} aria-label={`${selectedCourse.title}の地図を閉じる`}>地図を閉じる</button></> : null}</div>
      </section>
    </div>
    <div className="map-related-grid"><section><h2>関連コース</h2><div className="map-related-course-grid">{relatedCourses.map((course) => <CourseCard course={course} key={course.id} selected={course.id === selectedCourseId} onMapOpen={selectCourse} placement="map-related-courses" hideImage />)}</div></section><section><h2>関連スポット</h2>{relatedSpots.map((spot) => <a className="map-related-card" key={spot.id} href={mapExternalUrl(spot.mapQuery)} target="_blank" rel="noopener noreferrer" data-analytics-event="map_spot_click" data-page-type="map" data-content-id={spot.id} data-area-id={area.id} data-placement="map-related-spots">{spot.name} <span aria-hidden="true">↗</span></a>)}</section></div>
  </section>;
}
