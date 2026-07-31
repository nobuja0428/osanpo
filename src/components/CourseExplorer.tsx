"use client";

import { useEffect, useMemo, useState } from "react";
import { areas, courses } from "@/lib/content";
import type { CourseFilters } from "@/lib/filters";
import { filterCourses } from "@/lib/filters";
import { CourseCard } from "@/components/Cards";
import { trackEvent } from "@/components/Analytics";

const initialFilters: CourseFilters = {};

const filterLabels: Record<keyof CourseFilters, Record<string, string>> = {
  keyword: {},
  area: { koenji: "高円寺", kichijoji: "吉祥寺", asakusa: "浅草" },
  duration: { "60": "60分以内", "90": "90分以内", "120": "2時間以内", "180": "3時間以内" },
  budget: { "1000": "1,000円以内", "3000": "3,000円以内", "5000": "5,000円以内" },
  audience: { solo: "一人", friends: "友人", date: "デート", family: "家族" },
  mood: { history: "歴史", shopping: "買い物", vintage: "古着", nature: "自然", cafe: "カフェ" },
};

export function CourseExplorer() {
  const [filters, setFilters] = useState<CourseFilters>(initialFilters);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    queueMicrotask(() => {
      setFilters({
        area: params.get("area") ?? "",
        duration: params.get("duration") ?? "",
        budget: params.get("budget") ?? "",
        audience: params.get("audience") ?? "",
        mood: params.get("mood") ?? "",
        keyword: params.get("keyword") ?? "",
      });
    });
  }, []);

  const results = useMemo(() => filterCourses(courses, filters), [filters]);

  function update(name: keyof CourseFilters, value: string) {
    const next = { ...filters, [name]: value };
    setFilters(next);
    const params = new URLSearchParams();
    Object.entries(next).forEach(([key, item]) => {
      if (item) params.set(key, item);
    });
    window.history.replaceState(null, "", `${window.location.pathname}${params.size ? `?${params}` : ""}`);
    trackEvent("filter_apply", { filter_name: name, has_value: Boolean(value), result_count: filterCourses(courses, next).length });
  }

  return (
    <>
      <form className="filter-panel" onSubmit={(event) => event.preventDefault()} aria-label="コースを絞り込む">
        <label className="filter-keyword">キーワード
          <input value={filters.keyword ?? ""} onChange={(event) => update("keyword", event.target.value)} placeholder="高円寺、商店街、歴史…" />
        </label>
        <label>エリア
          <select value={filters.area ?? ""} onChange={(event) => update("area", event.target.value)}>
            <option value="">すべて</option>
            {areas.map((area) => <option value={area.id} key={area.id}>{area.name}</option>)}
          </select>
        </label>
        <label>時間
          <select value={filters.duration ?? ""} onChange={(event) => update("duration", event.target.value)}>
            <option value="">指定なし</option>
            <option value="60">60分以内</option>
            <option value="90">90分以内</option>
            <option value="120">2時間以内</option>
            <option value="180">3時間以内</option>
          </select>
        </label>
        <label>予算
          <select value={filters.budget ?? ""} onChange={(event) => update("budget", event.target.value)}>
            <option value="">指定なし</option>
            <option value="1000">1,000円以内</option>
            <option value="3000">3,000円以内</option>
            <option value="5000">5,000円以内</option>
          </select>
        </label>
        <label>同行者
          <select value={filters.audience ?? ""} onChange={(event) => update("audience", event.target.value)}>
            <option value="">指定なし</option>
            <option value="solo">一人</option>
            <option value="friends">友人</option>
            <option value="date">デート</option>
            <option value="family">家族</option>
          </select>
        </label>
        <label>気分
          <select value={filters.mood ?? ""} onChange={(event) => update("mood", event.target.value)}>
            <option value="">指定なし</option>
            <option value="history">歴史</option>
            <option value="shopping">買い物</option>
            <option value="vintage">古着</option>
            <option value="nature">公園・自然</option>
            <option value="cafe">カフェ</option>
          </select>
        </label>
        <button className="button button-secondary" type="button" onClick={() => {
          setFilters(initialFilters);
          window.history.replaceState(null, "", window.location.pathname);
          trackEvent("filter_clear");
        }}>条件をすべて解除</button>
      </form>
      {Object.entries(filters).some(([, value]) => value) ? (
        <div className="active-filters" aria-label="選択中の条件">
          {Object.entries(filters).filter(([, value]) => value).map(([key, value]) => {
            const filterKey = key as keyof CourseFilters;
            const label = filterKey === "keyword" ? value : filterLabels[filterKey][value ?? ""];
            return <button className="filter-chip" type="button" key={filterKey} onClick={() => update(filterKey, "")}>{label} を解除</button>;
          })}
        </div>
      ) : null}
      <p className="result-count" aria-live="polite">{results.length}件のコース</p>
      {results.length ? (
        <div className="card-grid">{results.map((course) => <CourseCard course={course} key={course.id} />)}</div>
      ) : (
        <div className="empty-state">
          <h2>条件に合うコースがありません</h2>
          <p>時間や予算を広げるか、条件を解除してお試しください。</p>
        </div>
      )}
    </>
  );
}
