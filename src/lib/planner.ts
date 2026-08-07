import type { Course } from "@/lib/content";
import { foodBreaks, toilets, transitAccess } from "@/lib/content";
import { isExpired, verificationFor } from "@/lib/verification";

export type PlanAssurance = "rest" | "toilet" | "transit" | "verified";

export type PlanCriteria = {
  duration?: string;
  budget?: string;
  audience?: string;
  mood?: string;
  assurances: PlanAssurance[];
};

export type CourseSafetySummary = {
  toiletCount: number;
  restCount: number;
  transitCount: number;
  officialSourceCount: number;
  informationCheckedAt: string;
  fieldResearch: boolean;
  estimated: boolean;
  needsRecheck: boolean;
};

export type PlanRecommendation = {
  course: Course;
  score: number;
  completeMatch: boolean;
  reasons: string[];
  safety: CourseSafetySummary;
};

const validValues = {
  duration: new Set(["60", "90", "120", "180", "any"]),
  budget: new Set(["1000", "3000", "5000", "any"]),
  audience: new Set(["solo", "friends", "date", "family", "any"]),
  mood: new Set(["history", "shopping", "vintage", "nature", "cafe", "any"]),
  assurance: new Set<PlanAssurance>(["rest", "toilet", "transit", "verified"]),
};

export const audienceLabels: Record<string, string> = {
  solo: "ひとり", friends: "友人", date: "デート", family: "家族",
};

export const moodLabels: Record<string, string> = {
  history: "歴史", shopping: "商店街・買い物", vintage: "古着・路地", nature: "自然", cafe: "カフェ",
};

function selected(value?: string) {
  return Boolean(value && value !== "any");
}

export function emptyPlanCriteria(): PlanCriteria {
  return { assurances: [] };
}

export function parsePlanCriteria(search: string): PlanCriteria {
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  const criteria = emptyPlanCriteria();
  for (const key of ["duration", "budget", "audience", "mood"] as const) {
    const value = params.get(key) ?? "";
    if (validValues[key].has(value)) criteria[key] = value;
  }
  const assurances = (params.get("assurance") ?? "").split(",").filter((value): value is PlanAssurance => validValues.assurance.has(value as PlanAssurance));
  criteria.assurances = [...new Set(assurances)];
  return criteria;
}

export function planCriteriaSearch(criteria: PlanCriteria) {
  const params = new URLSearchParams();
  for (const key of ["duration", "budget", "audience", "mood"] as const) {
    if (criteria[key]) params.set(key, criteria[key]!);
  }
  if (criteria.assurances.length) params.set("assurance", criteria.assurances.join(","));
  return params.toString();
}

export function courseSafetySummary(course: Course, now = new Date()): CourseSafetySummary {
  const verification = verificationFor("course", course.id)!;
  return {
    toiletCount: toilets.filter((item) => item.courseId === course.id).length,
    restCount: foodBreaks.filter((item) => item.courseId === course.id).length,
    transitCount: transitAccess.filter((item) => item.courseId === course.id).length,
    officialSourceCount: verification.officialSources.length,
    informationCheckedAt: verification.informationCheckedAt,
    fieldResearch: verification.fieldResearch,
    estimated: verification.estimated,
    needsRecheck: isExpired(verification, now),
  };
}

export function rankCourses(items: readonly Course[], criteria: PlanCriteria, now = new Date()): PlanRecommendation[] {
  return items.map((course, index) => {
    const safety = courseSafetySummary(course, now);
    const durationLimit = selected(criteria.duration) ? Number(criteria.duration) : undefined;
    const budgetLimit = selected(criteria.budget) ? Number(criteria.budget) : undefined;
    const durationMatch = durationLimit === undefined || course.durationMinutes <= durationLimit;
    const budgetMatch = budgetLimit === undefined || course.budgetMaxYen <= budgetLimit;
    const audienceMatch = !selected(criteria.audience) || course.audienceKeys.includes(criteria.audience!);
    const moodMatch = !selected(criteria.mood) || course.moodKeys.includes(criteria.mood!);
    let score = 0;
    const reasons: string[] = [];

    if (selected(criteria.duration) && durationMatch) { score += 2; reasons.push(`${durationLimit}分以内で歩けます`); }
    if (selected(criteria.budget) && budgetMatch) { score += 2; reasons.push(`予算${budgetLimit!.toLocaleString("ja-JP")}円以内です`); }
    if (selected(criteria.audience) && audienceMatch) { score += 2; reasons.push(`${audienceLabels[criteria.audience!]}散歩向けです`); }
    if (selected(criteria.mood) && moodMatch) { score += 2; reasons.push(`${moodLabels[criteria.mood!]}を楽しめます`); }
    if (criteria.assurances.includes("rest") && safety.restCount > 0) { score += 1; reasons.push(`休憩候補が${safety.restCount}件登録されています`); }
    if (criteria.assurances.includes("toilet") && safety.toiletCount > 0) { score += 1; reasons.push(`トイレ情報が${safety.toiletCount}件登録されています`); }
    if (criteria.assurances.includes("transit") && safety.transitCount > 0) { score += 1; reasons.push(`駅・交通情報が${safety.transitCount}件登録されています`); }
    if (criteria.assurances.includes("verified") && !safety.needsRecheck) { score += 1; reasons.push("情報の再確認期限内です"); }
    if (!reasons.length) reasons.push("公開中のコースから情報確認日と所要時間をもとにご案内します");

    const completeMatch = durationMatch && budgetMatch && audienceMatch && moodMatch;
    const hardMismatchCount = Number(!durationMatch) + Number(!budgetMatch);
    return { course, score, completeMatch, reasons, safety, hardMismatchCount, index };
  }).sort((a, b) =>
    a.hardMismatchCount - b.hardMismatchCount
    || b.score - a.score
    || b.safety.informationCheckedAt.localeCompare(a.safety.informationCheckedAt)
    || a.course.durationMinutes - b.course.durationMinutes
    || a.index - b.index
  ).map(({ course, score, completeMatch, reasons, safety }) => ({ course, score, completeMatch, reasons, safety }));
}
