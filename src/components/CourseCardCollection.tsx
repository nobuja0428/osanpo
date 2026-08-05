"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { trackEvent } from "@/components/Analytics";
import { CourseCard } from "@/components/Cards";
import { MapEmbed } from "@/components/MapEmbed";
import type { Course } from "@/lib/content";
import { areaById } from "@/lib/content";
import { courseRouteQueries, mapDirectionsUrl, mapExternalUrl } from "@/lib/maps";

export function CourseCardCollection({ items, placement }: { items: readonly Course[]; placement: string }) {
  const [selectedId, setSelectedId] = useState("");
  const selected = items.find((course) => course.id === selectedId);

  useEffect(() => () => { window.dispatchEvent(new Event("osanpo:course-map-close")); }, []);

  function openMap(courseId: string) {
    if (!selectedId) window.dispatchEvent(new Event("osanpo:course-map-open"));
    setSelectedId(courseId);
    const course = items.find((item) => item.id === courseId);
    trackEvent("course_map_open", { page_type: "course-list", content_id: courseId, area_id: course?.areaId ?? "", placement });
  }

  function closeMap() {
    if (selected) trackEvent("course_map_close", { page_type: "course-list", content_id: selected.id, area_id: selected.areaId, placement });
    setSelectedId("");
    window.dispatchEvent(new Event("osanpo:course-map-close"));
  }

  const routeQueries = selected ? courseRouteQueries(selected.routeStops) : [];
  const start = selected?.routeStops[0];
  const goal = selected?.routeStops[selected.routeStops.length - 1];
  const area = selected ? areaById(selected.areaId) : undefined;

  return <div className="course-card-collection">
    <div className="card-grid">{items.map((course) => <CourseCard course={course} key={course.id} selected={course.id === selectedId} onMapOpen={openMap} placement={placement} />)}</div>
    {selected ? <section className="course-map-drawer" aria-label={`${selected.title}の展開地図`} aria-live="polite">
      <div className="course-map-drawer-heading"><div><p className="eyebrow">{area?.name}・COURSE MAP</p><h2>{selected.title}</h2></div><button className="map-close-button" type="button" onClick={closeMap} aria-label={`${selected.title}の地図を閉じる`}>地図を閉じる</button></div>
      <div className="course-map-drawer-route"><p><span className="route-label is-start">START</span><strong>{start?.name}</strong></p><p><span className="route-label is-goal">GOAL</span><strong>{goal?.name}</strong></p></div>
      <p className="course-map-stops">主な立ち寄り地点：{selected.routeStops.slice(1, -1).map((stop) => stop.name).join("・")}</p>
      <MapEmbed query={routeQueries.join(" ")} title={`${selected.title}の一覧地図`} contentId={selected.id} areaId={selected.areaId} placement={`${placement}-expanded-map`} />
      <div className="route-actions"><Link className="button button-secondary" href={`/courses/${selected.id}/`}>コース詳細を見る</Link><a className="button button-primary" href={mapExternalUrl(routeQueries.join(" "))} target="_blank" rel="noopener noreferrer" data-analytics-event="google_map_click" data-page-type="course-list" data-content-id={selected.id} data-area-id={selected.areaId} data-placement={`${placement}-expanded-map`}>Googleマップで大きく開く <span aria-hidden="true">↗</span></a><a className="button button-secondary" href={mapDirectionsUrl(routeQueries)} target="_blank" rel="noopener noreferrer" data-analytics-event="walking_route_click" data-page-type="course-list" data-content-id={selected.id} data-area-id={selected.areaId} data-route-segment="whole" data-placement={`${placement}-expanded-map`}>徒歩ルートを開く <span aria-hidden="true">↗</span></a></div>
    </section> : null}
  </div>;
}
