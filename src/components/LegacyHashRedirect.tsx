"use client";

import { useEffect } from "react";
import { BASE_PATH } from "@/lib/site";

const fixedRoutes: Record<string, string> = {
  "#/areas": "/areas/",
  "#/courses": "/courses/",
  "#/spots": "/spots/",
  "#/stories": "/stories/",
  "#/events": "/events/",
  "#/map": "/map/",
  "#/search": "/search/",
  "#/favorites": "/favorites/",
  "#/about": "/about/",
  "#/operation": "/operation/",
  "#/editorial-policy": "/editorial-policy/",
  "#/policy": "/editorial-policy/",
  "#/privacy": "/privacy/",
  "#/advertise": "/advertise/",
  "#/advertising": "/advertise/",
  "#/contact": "/contact/",
};

const detailRoutes = [
  ["#/area/", "/areas/"],
  ["#/course/", "/courses/"],
  ["#/spot/", "/spots/"],
  ["#/story/", "/stories/"],
] as const;

export function LegacyHashRedirect() {
  useEffect(() => {
    const { hash } = window.location;
    if (!hash) return;

    const cleanHash = hash.split("?")[0];
    let destination = fixedRoutes[cleanHash];

    if (!destination) {
      const match = detailRoutes.find(([prefix]) => cleanHash.startsWith(prefix));
      if (match) destination = `${match[1]}${cleanHash.slice(match[0].length)}/`;
    }

    if (destination) {
      const query = hash.includes("?") ? hash.slice(hash.indexOf("?") + 1) : "";
      const normalizedQuery = query.replace(/^keyword=/, "q=");
      window.location.replace(`${BASE_PATH}${destination}${normalizedQuery ? `?${normalizedQuery}` : ""}`);
    }
  }, []);

  return null;
}
