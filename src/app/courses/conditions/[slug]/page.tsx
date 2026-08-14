import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CourseCardCollection } from "@/components/CourseCardCollection";
import { PageHero } from "@/components/PageHero";
import { RelatedContent } from "@/components/RelatedContent";
import { PublicStructuredData } from "@/components/PublicStructuredData";
import { courseLandingBySlug, courseLandings, coursesForLanding } from "@/lib/course-landings";
import { areaById, courses } from "@/lib/content";
import { absoluteUrl } from "@/lib/site";

export function generateStaticParams() {
  return courseLandings.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const landing = courseLandingBySlug(slug);
  if (!landing) return {};
  return {
    title: landing.title,
    description: landing.description,
    alternates: { canonical: absoluteUrl(`courses/conditions/${landing.slug}/`) },
  };
}

export default async function CourseConditionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const landing = courseLandingBySlug(slug);
  if (!landing) notFound();
  const matchingCourses = coursesForLanding(landing, courses);
  if (matchingCourses.length < 2) notFound();
  const relatedAreas = [...new Set(matchingCourses.map((course) => course.areaId))]
    .map(areaById)
    .filter((area): area is NonNullable<typeof area> => Boolean(area));

  return (
    <main id="main">
      <PublicStructuredData type="CollectionPage" name={landing.title} description={landing.description} path={`courses/conditions/${landing.slug}/`} parent={{ name: "コース", path: "courses/" }} items={matchingCourses.map((course) => ({ name: course.title, path: `courses/${course.id}/` }))} />
      <PageHero eyebrow={landing.eyebrow} title={landing.title} lead={landing.intro} crumbs={[{ href: "/courses/", label: "コース" }, { label: landing.conditionLabel }]} />
      <section className="section"><div className="container condition-landing-layout">
        <div className="condition-landing-summary"><div><p className="eyebrow">MATCHING COURSES</p><h2>{landing.conditionLabel}のコースは{matchingCourses.length}件</h2><p>{landing.description}</p></div><Link className="button button-accent" href="/plan/">30秒診断で条件を組み合わせる</Link></div>
        <CourseCardCollection items={matchingCourses} placement={`condition-${landing.slug}`} />
        <RelatedContent eyebrow="RELATED AREAS" title="該当コースのエリア" intro="公開中の実データに含まれる街だけを表示しています。" items={relatedAreas.map((area) => ({ href: `/areas/${area.id}/`, eyebrow: area.ward, title: area.name, description: area.description, contentId: area.id, areaId: area.id }))} pageType="course-condition" placement={`condition-${landing.slug}-areas`} />
        <aside className="condition-quality-note" aria-label="掲載情報について"><strong>掲載情報について</strong><p>コースの時間・予算には推定値を含みます。各詳細ページの情報確認日と公式情報源を確認し、現地の状況に合わせてご利用ください。</p><Link href="/editorial-policy/">情報確認方針を見る →</Link></aside>
      </div></section>
    </main>
  );
}
