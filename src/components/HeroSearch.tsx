"use client";

import { FormEvent, useMemo, useState } from "react";
import { areas, courses } from "@/lib/content";
import { filterCourses } from "@/lib/filters";
import { trackEvent } from "@/components/Analytics";

export function HeroSearch() {
  const [keyword, setKeyword] = useState("");
  const [area, setArea] = useState("");
  const resultCount = useMemo(() => filterCourses(courses, { keyword, area }).length, [area, keyword]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (keyword.trim()) params.set("keyword", keyword.trim());
    if (area) params.set("area", area);
    trackEvent("search_submit", { has_keyword: Boolean(keyword.trim()), area_id: area || "all", result_count: resultCount });
    window.location.assign(`/osanpo/courses/${params.size ? `?${params}` : ""}`);
  }

  return (
    <form className="hero-search" onSubmit={submit} aria-label="トップからコースを探す">
      <label><span>キーワード</span><input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="街、商店街、歴史から探す" /></label>
      <label><span>エリア</span><select value={area} onChange={(event) => setArea(event.target.value)}><option value="">すべての公開エリア</option>{areas.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
      <button className="button button-primary" type="submit">検索する</button>
    </form>
  );
}
