import type { Metadata } from "next";
import { CourseExplorer } from "@/components/CourseExplorer";
import { PageHero } from "@/components/PageHero";
import { absoluteUrl } from "@/lib/site";
import Link from "next/link";
import { MonetizationSlot } from "@/components/MonetizationSlot";
import { courseLandings } from "@/lib/course-landings";

export const metadata: Metadata = {
  title: "東京の散歩コース検索",
  description: "エリア、時間、予算、同行者、気分から東京の散歩コースを絞り込めます。",
  alternates: { canonical: absoluteUrl("courses/") },
};

export default function CoursesPage() {
  return (
    <main id="main">
      <PageHero eyebrow="COURSE FINDER" title="条件から散歩コースを探す" lead="時間、予算、同行者、気分を組み合わせて、今日に合うコースを選べます。" crumbs={[{ label: "コース" }]} />
      <section className="section"><div className="container"><p className="course-plan-link">条件を順番に選びたい方は、<Link href="/plan/">今日のおさんぽプランへ</Link></p><CourseExplorer /><nav className="condition-landing-links" aria-labelledby="condition-landing-links-title"><div><p className="eyebrow">POPULAR CONDITIONS</p><h2 id="condition-landing-links-title">公開中コースを条件別に見る</h2><p>該当コースが2件以上ある条件だけを掲載しています。</p></div><div>{courseLandings.map((landing) => <Link href={`/courses/conditions/${landing.slug}/`} key={landing.slug}>{landing.conditionLabel}<span aria-hidden="true">→</span></Link>)}</div></nav></div></section>
      <section className="section section-tint monetization-section" aria-label="広告掲載案内"><div className="container"><MonetizationSlot placement="courses-after-grid" contentId="courses" /></div></section>
    </main>
  );
}
