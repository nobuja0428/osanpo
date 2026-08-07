import type { Metadata } from "next";
import { CourseExplorer } from "@/components/CourseExplorer";
import { PageHero } from "@/components/PageHero";
import { absoluteUrl } from "@/lib/site";
import Link from "next/link";

export const metadata: Metadata = {
  title: "東京の散歩コース検索",
  description: "エリア、時間、予算、同行者、気分から東京の散歩コースを絞り込めます。",
  alternates: { canonical: absoluteUrl("courses/") },
};

export default function CoursesPage() {
  return (
    <main id="main">
      <PageHero eyebrow="COURSE FINDER" title="条件から散歩コースを探す" lead="時間、予算、同行者、気分を組み合わせて、今日に合うコースを選べます。" crumbs={[{ label: "コース" }]} />
      <section className="section"><div className="container"><p className="course-plan-link">条件を順番に選びたい方は、<Link href="/plan/">今日のおさんぽプランへ</Link></p><CourseExplorer /></div></section>
    </main>
  );
}
