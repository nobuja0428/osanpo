"use client";

import { useEffect, useMemo, useState } from "react";
import { CourseCardCollection } from "@/components/CourseCardCollection";
import { trackEvent } from "@/components/Analytics";
import { areas, courses } from "@/lib/content";
import type { CourseFilters } from "@/lib/filters";
import { filterCourses } from "@/lib/filters";

const initialFilters: CourseFilters = {};
const legacyValues: Record<string, Record<string, string>> = {
  duration: { "150": "180" },
  budget: { "2500": "3000", "3500": "5000", "4000": "5000" },
};

const filterLabels: Record<keyof CourseFilters, Record<string, string>> = {
  keyword: {},
  area: { koenji: "高円寺", kichijoji: "吉祥寺", asakusa: "浅草" },
  duration: { "60": "60分以内", "90": "90分以内", "120": "2時間以内", "180": "3時間以内" },
  budget: { "1000": "1,000円以内", "3000": "3,000円以内", "5000": "5,000円以内" },
  audience: { solo: "ひとり", friends: "友人と", date: "デート", family: "家族と" },
  mood: { history: "歴史", shopping: "買い物", vintage: "古着", nature: "自然", cafe: "カフェ" },
};

function readFilters(): CourseFilters {
  const params = new URLSearchParams(window.location.search);
  const entries = ["area", "duration", "budget", "audience", "mood", "keyword"] as const;
  return Object.fromEntries(entries.map((key) => {
    const raw = params.get(key) ?? "";
    return [key, legacyValues[key]?.[raw] ?? raw];
  })) as CourseFilters;
}

export function CourseExplorer() {
  const [filters, setFilters] = useState<CourseFilters>(initialFilters);
  const results = useMemo(() => filterCourses(courses, filters), [filters]);

  useEffect(() => {
    const restore = () => setFilters(readFilters());
    restore();
    window.addEventListener("popstate", restore);
    return () => window.removeEventListener("popstate", restore);
  }, []);

  function write(next: CourseFilters, action: "apply" | "remove" | "clear", changed = "") {
    setFilters(next);
    const params = new URLSearchParams();
    Object.entries(next).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    window.history.pushState(null, "", `${window.location.pathname}${params.size ? `?${params}` : ""}`);
    trackEvent(`course_filter_${action}`, {
      filter_name: changed,
      selected_filter_count: Object.values(next).filter(Boolean).length,
      result_count: filterCourses(courses, next).length,
    });
  }

  function update(name: keyof CourseFilters, value: string) {
    write({ ...filters, [name]: value }, value ? "apply" : "remove", name);
  }

  return (
    <>
      <form className="filter-panel filter-panel-complete" onSubmit={(event) => event.preventDefault()} aria-label="コースを絞り込む">
        <label className="filter-keyword">キーワード
          <input value={filters.keyword ?? ""} onChange={(event) => update("keyword", event.target.value)} placeholder="街、商店街、歴史、カフェから探す" />
        </label>
        <label>エリア
          <select value={filters.area ?? ""} onChange={(event) => update("area", event.target.value)}>
            <option value="">すべて</option>
            {areas.map((area) => <option value={area.id} key={area.id}>{area.name}</option>)}
          </select>
        </label>
        <label>所要時間
          <select value={filters.duration ?? ""} onChange={(event) => update("duration", event.target.value)}>
            <option value="">指定なし</option><option value="60">60分以内</option><option value="90">90分以内</option><option value="120">2時間以内</option><option value="180">3時間以内</option>
          </select>
        </label>
        <label>予算
          <select value={filters.budget ?? ""} onChange={(event) => update("budget", event.target.value)}>
            <option value="">指定なし</option><option value="1000">1,000円以内</option><option value="3000">3,000円以内</option><option value="5000">5,000円以内</option>
          </select>
        </label>
        <label>同行者
          <select value={filters.audience ?? ""} onChange={(event) => update("audience", event.target.value)}>
            <option value="">指定なし</option><option value="solo">ひとり</option><option value="friends">友人と</option><option value="date">デート</option><option value="family">家族と</option>
          </select>
        </label>
        <label>気分・テーマ
          <select value={filters.mood ?? ""} onChange={(event) => update("mood", event.target.value)}>
            <option value="">指定なし</option><option value="history">歴史</option><option value="shopping">買い物</option><option value="vintage">古着</option><option value="nature">自然</option><option value="cafe">カフェ</option>
          </select>
        </label>
        <button className="button button-secondary" type="button" onClick={() => write(initialFilters, "clear")}>条件をすべて解除</button>
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
      {results.length ? <CourseCardCollection key={results.map((course) => course.id).join("-")} items={results} placement="courses-filter-results" /> : <div className="empty-state"><h2>条件に合うコースがありません</h2><p>条件を減らすか、キーワードを変えてもう一度お試しください。</p></div>}
    </>
  );
}
