"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { trackEvent } from "@/components/Analytics";
import { areas, courses, spots, stories } from "@/lib/content";

const records = [
  ...areas.map((item) => ({ key: `area:${item.id}`, href: `/areas/${item.id}/`, type: "エリア", title: item.name, text: `${item.lead} ${item.description} ${item.tags.join(" ")}` })),
  ...courses.map((item) => ({ key: `course:${item.id}`, href: `/courses/${item.id}/`, type: "コース", title: item.title, text: `${item.summary} ${item.audience} ${item.moodKeys.join(" ")}` })),
  ...spots.map((item) => ({ key: `spot:${item.id}`, href: `/spots/${item.id}/`, type: "スポット", title: item.name, text: `${item.category} ${item.excerpt}` })),
  ...stories.map((item) => ({ key: `story:${item.id}`, href: `/stories/${item.id}/`, type: "読み物", title: item.title, text: `${item.category} ${item.excerpt} ${item.intro}` })),
];

export function SearchClient() {
  const [query, setQuery] = useState("");

  useEffect(() => {
    const value = new URLSearchParams(window.location.search).get("q") ?? "";
    queueMicrotask(() => setQuery(value));
  }, []);

  const results = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("ja");
    if (!normalized) return records;
    return records.filter((record) => `${record.title} ${record.text}`.toLocaleLowerCase("ja").includes(normalized));
  }, [query]);

  function submit(event: FormEvent) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    window.history.replaceState(null, "", `${window.location.pathname}${params.size ? `?${params}` : ""}`);
    trackEvent("search_submit", { has_keyword: Boolean(query.trim()), result_count: results.length });
  }

  return (
    <>
      <form className="filter-panel" onSubmit={submit} role="search">
        <label className="filter-keyword">キーワード
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="街、スポット、気分から検索" />
        </label>
        <button className="button button-primary" type="submit">検索する</button>
        <button className="button button-secondary" type="button" onClick={() => {
          setQuery("");
          window.history.replaceState(null, "", window.location.pathname);
        }}>検索を解除</button>
      </form>
      <p className="result-count" aria-live="polite">{results.length}件</p>
      {results.length ? (
        <div className="card-grid">
          {results.map((record) => (
            <article className="card" key={record.key}>
              <div className="card-body">
                <p className="eyebrow">{record.type}</p>
                <h2><Link href={record.href}>{record.title}</Link></h2>
                <p>{record.text}</p>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state"><h2>一致する情報がありません</h2><p>短い言葉に変えるか、検索を解除してお試しください。</p></div>
      )}
    </>
  );
}
