import type { MetadataRoute } from "next";
import { areas, courses, spots, stories } from "@/lib/content";
import { absoluteUrl } from "@/lib/site";
import { isExpired, verificationFor } from "@/lib/verification";

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
    ...areas.filter((area) => !isExpired(verificationFor("area", area.id)!)).map((area) => ({ url: absoluteUrl(`areas/${area.id}/`) })),
    ...courses.filter((course) => !isExpired(verificationFor("course", course.id)!)).map((course) => ({ url: absoluteUrl(`courses/${course.id}/`) })),
    ...spots.filter((spot) => !isExpired(verificationFor("spot", spot.id)!)).map((spot) => ({ url: absoluteUrl(`spots/${spot.id}/`) })),
    ...stories.filter((story) => !isExpired(verificationFor("story", story.id)!)).map((story) => ({ url: absoluteUrl(`stories/${story.id}/`) })),
  ];
}
