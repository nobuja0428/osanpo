"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { areas, courses, spots, stories } from "@/lib/content";

const STORAGE_KEY = "osanpoClubFavoritesV1";

const records = [
  ...areas.map((item) => ({ key: `area:${item.id}`, href: `/areas/${item.id}/`, label: item.name, type: "エリア" })),
  ...courses.map((item) => ({ key: `course:${item.id}`, href: `/courses/${item.id}/`, label: item.title, type: "コース" })),
  ...spots.map((item) => ({ key: `spot:${item.id}`, href: `/spots/${item.id}/`, label: item.name, type: "スポット" })),
  ...stories.map((item) => ({ key: `story:${item.id}`, href: `/stories/${item.id}/`, label: item.title, type: "読み物" })),
];

export function FavoritesClient() {
  const [keys, setKeys] = useState<string[]>([]);

  useEffect(() => {
    queueMicrotask(() => {
      try {
        const value = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
        setKeys(Array.isArray(value) ? value : []);
      } catch {
        setKeys([]);
      }
    });
  }, []);

  const favorites = records.filter((record) => keys.includes(record.key));

  if (!favorites.length) {
    return (
      <div className="empty-state">
        <h2>お気に入りはまだありません</h2>
        <p>エリア、コース、スポット、読み物の詳細ページから追加できます。</p>
        <Link className="button button-primary" href="/courses/">コースを探す</Link>
      </div>
    );
  }

  return (
    <div className="card-grid">
      {favorites.map((record) => (
        <article className="card" key={record.key}>
          <div className="card-body">
            <p className="eyebrow">{record.type}</p>
            <h2><Link href={record.href}>{record.label}</Link></h2>
          </div>
        </article>
      ))}
    </div>
  );
}
