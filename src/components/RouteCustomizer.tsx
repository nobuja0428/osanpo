"use client";

import { useEffect, useMemo, useState } from "react";
import { trackEvent } from "@/components/Analytics";
import type { Course } from "@/lib/content";
import { mapDirectionsUrl } from "@/lib/maps";

function validOrdersFromSearch(course: Course, search: string) {
  const valid = new Set(course.routeStops.map((stop) => stop.order));
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  const raw = params.get("stops");
  if (raw === null) return course.routeStops.map((stop) => stop.order);
  const selected = raw.split(",").map(Number).filter((order) => Number.isInteger(order) && valid.has(order));
  const first = course.routeStops[0]!.order;
  const last = course.routeStops.at(-1)!.order;
  return course.routeStops.map((stop) => stop.order).filter((order) => order === first || order === last || selected.includes(order));
}

export function RouteCustomizer({ course }: { course: Course }) {
  const allOrders = useMemo(() => course.routeStops.map((stop) => stop.order), [course]);
  const [selectedOrders, setSelectedOrders] = useState(allOrders);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const restore = () => setSelectedOrders(validOrdersFromSearch(course, window.location.search));
    restore();
    window.addEventListener("popstate", restore);
    return () => window.removeEventListener("popstate", restore);
  }, [course]);

  const selectedStops = course.routeStops.filter((stop) => selectedOrders.includes(stop.order));
  const routeUrl = mapDirectionsUrl(selectedStops.map((stop) => stop.query));

  function write(next: number[]) {
    const ordered = allOrders.filter((order) => next.includes(order));
    setSelectedOrders(ordered);
    const params = new URLSearchParams(window.location.search);
    params.set("stops", ordered.join(","));
    window.history.pushState(null, "", `${window.location.pathname}?${params}`);
  }

  function toggle(order: number) {
    const next = selectedOrders.includes(order) ? selectedOrders.filter((value) => value !== order) : [...selectedOrders, order];
    write(next);
    trackEvent("route_stop_toggle", { content_id: course.id, area_id: course.areaId, selected_stop_count: next.length, placement: "course-customizer" });
  }

  function reset() {
    setSelectedOrders(allOrders);
    const params = new URLSearchParams(window.location.search);
    params.delete("stops");
    window.history.pushState(null, "", `${window.location.pathname}${params.size ? `?${params}` : ""}`);
    setMessage("元のコースに戻しました。");
  }

  async function copyLink() {
    try {
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(window.location.href);
      else {
        const textarea = document.createElement("textarea");
        textarea.value = window.location.href;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        textarea.remove();
      }
      setMessage("リンクをコピーしました。");
      trackEvent("plan_link_copy", { content_id: course.id, area_id: course.areaId, selected_stop_count: selectedStops.length, placement: "course-customizer" });
    } catch {
      setMessage("コピーできませんでした。ブラウザのアドレス欄からURLをコピーしてください。");
    }
  }

  async function sharePlan() {
    trackEvent("plan_share", { content_id: course.id, area_id: course.areaId, selected_stop_count: selectedStops.length, placement: "course-customizer" });
    try {
      if (!navigator.share) throw new Error("share unavailable");
      await navigator.share({ title: course.title, text: "今日のおさんぽプラン", url: window.location.href });
      setMessage("共有画面を開きました。");
    } catch {
      await copyLink();
    }
  }

  return (
    <section className="route-customizer" id="course-customizer" aria-labelledby="course-customizer-title">
      <p className="eyebrow">CUSTOMIZE</p><h2 id="course-customizer-title">このコースを自分用に調整する</h2>
      <p>STARTとGOALは固定です。途中の立ち寄り地点だけを外し、既存の順番のまま徒歩ルートを作れます。</p>
      <ol className="custom-stop-list">{course.routeStops.map((stop, index) => {
        const fixed = stop.role === "start" || stop.role === "goal";
        const selected = selectedOrders.includes(stop.order);
        const stage = stop.role === "start" ? "START" : stop.role === "goal" ? "GOAL" : `STOP ${index}`;
        return <li className={`${stop.role === "start" ? "is-start" : stop.role === "goal" ? "is-goal" : "is-stop"}${selected ? "" : " is-removed"}`} key={stop.order}>
          <label><input type="checkbox" checked={selected} disabled={fixed} onChange={() => toggle(stop.order)} /><span className="custom-stop-stage">{stage}</span><span><strong>{stop.name}</strong><small>{stop.role === "stop" ? "立ち寄り地点" : "固定地点"}</small></span></label>
        </li>;
      })}</ol>
      <p className="custom-route-count" aria-live="polite">選択中：{selectedStops.length}地点（START・GOALを含む）</p>
      <div className="route-actions"><a className="button button-primary" href={routeUrl} target="_blank" rel="noopener noreferrer" data-analytics-event="custom_route_click" data-content-id={course.id} data-area-id={course.areaId} data-selected-stop-count={selectedStops.length} data-placement="course-customizer">調整した徒歩ルートを開く <span aria-hidden="true">↗</span></a>{course.routeSegments.map((segment) => {
        const segmentStops = selectedStops.filter((stop) => stop.order >= segment.originStopOrder && stop.order <= segment.destinationStopOrder);
        if (segmentStops.length < 2) return null;
        return <a className="button button-secondary" key={segment.id} href={mapDirectionsUrl(segmentStops.map((stop) => stop.query))} target="_blank" rel="noopener noreferrer" data-analytics-event="custom_route_click" data-content-id={course.id} data-area-id={course.areaId} data-route-segment={segment.id} data-selected-stop-count={segmentStops.length} data-placement="course-customizer-segment">{segment.label}ルートを開く <span aria-hidden="true">↗</span></a>;
      })}</div>
      <div className="customizer-controls"><button className="button button-secondary" type="button" onClick={reset}>元のコースに戻す</button><button className="button button-secondary" type="button" onClick={sharePlan}>このプランを共有</button><button className="button button-secondary" type="button" onClick={copyLink}>リンクをコピー</button></div>
      <p className="share-status" role="status" aria-live="polite">{message}</p>
    </section>
  );
}
