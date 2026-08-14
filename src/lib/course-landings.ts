import type { Course } from "@/lib/content";

export type CourseLanding = {
  slug: string;
  title: string;
  description: string;
  eyebrow: string;
  intro: string;
  conditionLabel: string;
  matches: (course: Course) => boolean;
};

export const courseLandings: readonly CourseLanding[] = [
  {
    slug: "solo",
    title: "ひとりで楽しむ東京散歩",
    description: "ひとり散歩の対象として登録された、高円寺・吉祥寺・浅草の公開中コースをまとめています。",
    eyebrow: "SOLO WALKS IN TOKYO",
    intro: "自分のペースで歩きやすい候補を、所要時間・予算・テーマと一緒に比較できます。",
    conditionLabel: "ひとり向け",
    matches: (course) => course.audienceKeys.includes("solo"),
  },
  {
    slug: "shopping",
    title: "商店街を楽しむ東京散歩",
    description: "商店街・買い物のテーマを含む、高円寺と浅草の公開中散歩コースをまとめています。",
    eyebrow: "SHOPPING STREET WALKS",
    intro: "地域の日常が見える商店街を軸に、寺社や路地も組み合わせたコースを選べます。",
    conditionLabel: "商店街・買い物",
    matches: (course) => course.moodKeys.includes("shopping"),
  },
] as const;

export function courseLandingBySlug(slug: string) {
  return courseLandings.find((landing) => landing.slug === slug);
}

export function coursesForLanding(landing: CourseLanding, courses: readonly Course[]) {
  return courses.filter(landing.matches);
}
