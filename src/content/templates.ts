export const sharedContentTemplateFields = [
  "id", "title", "summary", "area", "officialSource", "informationCheckedAt", "lastUpdatedAt",
  "expiresAt", "mapQuery", "aiAssisted", "fieldResearch", "estimated", "image", "imageAlt",
] as const;

export type SharedContentTemplate = {
  id: string;
  title: string;
  summary: string;
  area: string;
  officialSource: { label: string; url: string }[];
  informationCheckedAt: string;
  lastUpdatedAt: string;
  expiresAt?: string;
  mapQuery: string;
  aiAssisted: boolean;
  fieldResearch: boolean;
  estimated: boolean;
  image: string;
  imageAlt: string;
};

export const contentTemplates = {
  area: { required: sharedContentTemplateFields, additional: ["stations", "duration", "budget", "tags"] },
  course: { required: sharedContentTemplateFields, additional: ["durationMinutes", "budgetMaxYen", "audienceKeys", "moodKeys", "routeStops", "routeSegments"] },
  spot: { required: sharedContentTemplateFields, additional: ["category", "officialUrl"] },
  story: { required: sharedContentTemplateFields, additional: ["category", "readTime", "intro", "sections"] },
  event: { required: sharedContentTemplateFields, additional: ["start", "end", "venue", "price", "officialUrl"] },
} as const;

export function defineContentRecord<T extends SharedContentTemplate>(record: T): T {
  return record;
}
