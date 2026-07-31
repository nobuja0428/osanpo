import verificationData from "@/content/verification-data.json";

export type ContentType = "area" | "course" | "spot" | "story" | "event";
export type SourceType = "official" | "open-data" | "rss" | "api" | "editorial";
export type ConfidenceLevel = "high" | "medium" | "low";

export type ContentSource = {
  label: string;
  url: string;
  sourceType: SourceType;
};

export type ContentVerification = {
  informationCheckedAt: string;
  lastUpdatedAt: string;
  expiresAt?: string;
  confidence: ConfidenceLevel;
  fieldResearch: boolean;
  aiAssisted: boolean;
  estimated: boolean;
  officialSources: ContentSource[];
  internalPath: string;
};

export const verificationCatalog = verificationData as Record<string, ContentVerification>;

export function contentKey(type: ContentType, id: string) {
  return `${type}:${id}`;
}

export function verificationFor(type: ContentType, id: string) {
  return verificationCatalog[contentKey(type, id)];
}

export function isExpired(verification: ContentVerification, now = new Date()) {
  if (!verification.expiresAt) return false;
  return new Date(`${verification.expiresAt}T23:59:59+09:00`).getTime() < now.getTime();
}

export function dateLabel(date: string) {
  const [year, month, day] = date.split("-");
  return year && month && day ? `${year}年${Number(month)}月${Number(day)}日` : date;
}
