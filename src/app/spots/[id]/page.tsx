import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { FavoriteButton } from "@/components/FavoriteButton";
import { PageHero } from "@/components/PageHero";
import { TrustPanel } from "@/components/TrustPanel";
import { areaById, courses, imagePath, officialSourcesFor, spotById, spots, stories } from "@/lib/content";
import { absoluteUrl, assetUrl } from "@/lib/site";
import { verificationFor } from "@/lib/verification";
import { ContentViewTracker } from "@/components/ContentViewTracker";
import { MonetizationSlot } from "@/components/MonetizationSlot";
import { RelatedContent } from "@/components/RelatedContent";
import { PublicStructuredData } from "@/components/PublicStructuredData";

export function generateStaticParams() {
  return spots.map((spot) => ({ id: spot.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const spot = spotById(id);
  if (!spot) return {};
  return {
    title: spot.name,
    description: spot.excerpt,
    alternates: { canonical: absoluteUrl(`spots/${spot.id}/`) },
    openGraph: { images: [{ url: absoluteUrl(imagePath(spot.image)), width: 1200, height: 900, alt: spot.imageAlt }] },
  };
}

export default async function SpotDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const spot = spotById(id);
  if (!spot) notFound();
  const area = areaById(spot.areaId);
  if (!area) notFound();
  const verification = verificationFor("spot", spot.id);
  if (!verification) notFound();
  const sources = officialSourcesFor(spot.areaId);
  const areaCourses = courses.filter((course) => course.areaId === spot.areaId).slice(0, 2);
  const siblingSpots = spots.filter((item) => item.id !== spot.id && item.areaId === spot.areaId).slice(0, 2);
  const relatedStories = stories.filter((story) => story.areaId === spot.areaId).slice(0, 1);

  return (
    <main id="main">
      <PublicStructuredData type="TouristAttraction" name={spot.name} description={spot.excerpt} path={`spots/${spot.id}/`} parent={{ name: "スポット", path: "spots/" }} image={imagePath(spot.image)} dateModified={verification.lastUpdatedAt} />
      <ContentViewTracker type="spot" id={spot.id} areaId={spot.areaId} />
      <PageHero eyebrow={`${area.name}・${spot.category}`} title={spot.name} lead={spot.excerpt} crumbs={[{ href: "/spots/", label: "スポット" }, { label: spot.name }]} />
      <section className="section">
        <div className="container detail-grid">
          <article>
            <div className="detail-cover">
              <Image src={assetUrl(imagePath(spot.image))} alt={spot.imageAlt} width={800} height={600} sizes="(max-width: 900px) calc(100vw - 40px), 740px" />
              <span className="image-label">イメージ</span>
            </div>
            <FavoriteButton type="spot" id={spot.id} />
            <TrustPanel verification={verification} />
            <p>{spot.excerpt}</p>
            <p>
              <a className="button button-primary" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(spot.mapQuery)}`} target="_blank" rel="noreferrer">Googleマップで見る</a>
              {" "}
              {spot.officialUrl ? <a className="button button-secondary" href={spot.officialUrl} target="_blank" rel="noreferrer">公式情報</a> : null}
            </p>
            <p><Link href={`/areas/${area.id}/`}>{area.name}のエリアガイドへ</Link></p>
            <RelatedContent eyebrow="WALK THIS AREA" title="この街を歩くコース" items={areaCourses.map((course) => ({ href: `/courses/${course.id}/`, eyebrow: `${area.name}・モデルコース`, title: course.title, description: `${course.duration}・${course.distance}・${course.budget}`, contentId: course.id, areaId: course.areaId }))} pageType="spot" placement="spot-related-courses" />
            <RelatedContent eyebrow="NEARBY SPOTS" title="同じエリアの別スポット" items={siblingSpots.map((item) => ({ href: `/spots/${item.id}/`, eyebrow: item.category, title: item.name, description: item.excerpt, contentId: item.id, areaId: item.areaId }))} pageType="spot" placement="spot-related-spots" />
            <RelatedContent eyebrow="AREA STORY" title={`${area.name}の読み物`} items={relatedStories.map((story) => ({ href: `/stories/${story.id}/`, eyebrow: story.category, title: story.title, description: story.excerpt, contentId: story.id, areaId: story.areaId }))} pageType="spot" placement="spot-related-story" />
          </article>
          <aside className="sidebar-panel">
            <h2>掲載情報について</h2>
            <p>公開情報をもとに編集し、AIによる整理を使用しています。現地取材は未実施です。</p>
            <h3>公式情報源</h3>
            <ul className="source-list">{sources.map((source) => <li key={source.url}><a href={source.url} target="_blank" rel="noreferrer">{source.label}</a></li>)}</ul>
          </aside>
        </div>
        <div className="container detail-monetization"><MonetizationSlot placement="spot-detail-end" contentId={spot.id} areaId={spot.areaId} /></div>
      </section>
    </main>
  );
}
