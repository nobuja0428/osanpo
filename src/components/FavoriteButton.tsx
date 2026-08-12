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
    const timeout = window.setTimeout(() => setActive(readFavorites().includes(key)), 0);
    return () => window.clearTimeout(timeout);
  }, [key]);

  const toggle = () => {
    const current = readFavorites();
    const nextActive = !current.includes(key);
    const next = nextActive ? [...current, key] : current.filter((item) => item !== key);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setActive(nextActive);
    trackEvent("favorite_change", { content_id: key, active: nextActive });
  };

  return (
    <button className={`favorite${active ? " is-active" : ""}`} type="button" data-favorite-key={key} aria-pressed={active} onClick={toggle}>
      <span aria-hidden="true">{active ? "★" : "☆"}</span> {active ? "お気に入り済み" : "お気に入りに追加"}
    </button>
  );
}
