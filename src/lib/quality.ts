import type { ContentVerification } from "@/lib/verification";

export type QualityIssue = { level: "error" | "warning"; code: string; message: string };

const sourceTypes = new Set(["official", "open-data", "rss", "api", "editorial"]);
const confidenceLevels = new Set(["high", "medium", "low"]);
const experienceClaims = /実際に歩いて確認しました|行って分かりました|食べてみました|おすすめします|絶対に楽しめます|必ず営業しています|最新です|完全ガイド/;

function validDate(value: string | undefined) {
  return Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(new Date(`${value}T00:00:00+09:00`).getTime()));
}

export function verifyContentRecord(input: {
  key: string;
  title: string;
  description: string;
  image?: string;
  canonical: string;
  verification?: ContentVerification;
  eventDates?: { start: string; end: string };
  body?: string;
}) {
  const issues: QualityIssue[] = [];
  const { verification } = input;
  if (!input.title.trim()) issues.push({ level: "error", code: "title", message: `${input.key}: title is required` });
  if (!input.description.trim()) issues.push({ level: "error", code: "description", message: `${input.key}: description is required` });
  if (!input.canonical.startsWith("https://")) issues.push({ level: "error", code: "canonical", message: `${input.key}: canonical must use HTTPS` });
  if (!input.image) issues.push({ level: "error", code: "image", message: `${input.key}: image is required` });
  if (experienceClaims.test(`${input.title} ${input.description} ${input.body ?? ""}`)) issues.push({ level: "error", code: "experience-claim", message: `${input.key}: unsupported experience claim` });
  if (!verification) {
    issues.push({ level: "error", code: "verification", message: `${input.key}: verification is required` });
    return issues;
  }
  if (!validDate(verification.informationCheckedAt)) issues.push({ level: "error", code: "checked-at", message: `${input.key}: informationCheckedAt is invalid` });
  if (!validDate(verification.lastUpdatedAt)) issues.push({ level: "error", code: "updated-at", message: `${input.key}: lastUpdatedAt is invalid` });
  if (verification.expiresAt && !validDate(verification.expiresAt)) issues.push({ level: "error", code: "expires-at", message: `${input.key}: expiresAt is invalid` });
  if (verification.expiresAt && verification.lastUpdatedAt > verification.expiresAt) issues.push({ level: "error", code: "expires-before-update", message: `${input.key}: expiresAt precedes lastUpdatedAt` });
  if (!confidenceLevels.has(verification.confidence)) issues.push({ level: "error", code: "confidence", message: `${input.key}: confidence is invalid` });
  if (typeof verification.fieldResearch !== "boolean" || typeof verification.aiAssisted !== "boolean" || typeof verification.estimated !== "boolean") issues.push({ level: "error", code: "booleans", message: `${input.key}: verification booleans are required` });
  if (!verification.internalPath.startsWith("/")) issues.push({ level: "error", code: "internal-link", message: `${input.key}: internal link is required` });
  if (!verification.officialSources.length) issues.push({ level: "error", code: "official-sources", message: `${input.key}: at least one official source is required` });
  verification.officialSources.forEach((source) => {
    if (!source.label.trim() || !source.url.startsWith("https://") || !sourceTypes.has(source.sourceType)) issues.push({ level: "error", code: "source", message: `${input.key}: source must have an HTTPS URL and valid type` });
  });
  if (verification.expiresAt && new Date(`${verification.expiresAt}T23:59:59+09:00`).getTime() < Date.now()) issues.push({ level: "warning", code: "expired", message: `${input.key}: verification has expired and is queued for recheck` });
  if (input.eventDates && new Date(input.eventDates.end).getTime() < new Date(input.eventDates.start).getTime()) issues.push({ level: "error", code: "event-date-order", message: `${input.key}: event end precedes start` });
  return issues;
}
