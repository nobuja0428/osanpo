"use client";

import { useEffect, useState } from "react";
import { trackEvent } from "@/components/Analytics";

const STORAGE_KEY = "osanpoClubFavoritesV1";

function readFavorites() {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

export function FavoriteButton({ type, id }: { type: "area" | "course" | "spot" | "story"; id: string }) {
  const key = `${type}:${id}`;
  const [active, setActive] = useState(false);

  useEffect(() => {
    queueMicrotask(() => setActive(readFavorites().includes(key)));
  }, [key]);

  function toggle() {
    const current = readFavorites();
    const next = current.includes(key) ? current.filter((item) => item !== key) : [...current, key];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setActive(next.includes(key));
    trackEvent("favorite_change", { content_type: type, content_id: id, active: next.includes(key) });
  }

  return (
    <button className={active ? "favorite is-active" : "favorite"} type="button" aria-pressed={active} onClick={toggle}>
      <span aria-hidden="true">{active ? "★" : "☆"}</span> {active ? "お気に入り済み" : "お気に入りに追加"}
    </button>
  );
}
