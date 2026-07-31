import type { MetadataRoute } from "next";
import { areas, courses, spots, stories } from "@/lib/content";
import { absoluteUrl } from "@/lib/site";

export const dynamic = "force-static";

const staticPaths = [
  "",
  "areas/",
  "courses/",
  "spots/",
  "stories/",
  "events/",
  "map/",
  "about/",
  "operation/",
  "editorial-policy/",
  "privacy/",
  "advertise/",
  "contact/",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...staticPaths.map((path) => ({ url: absoluteUrl(path) })),
    ...areas.map((area) => ({ url: absoluteUrl(`areas/${area.id}/`) })),
    ...courses.map((course) => ({ url: absoluteUrl(`courses/${course.id}/`) })),
    ...spots.map((spot) => ({ url: absoluteUrl(`spots/${spot.id}/`) })),
    ...stories.map((story) => ({ url: absoluteUrl(`stories/${story.id}/`) })),
  ];
}
