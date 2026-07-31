import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { FavoriteButton } from "@/components/FavoriteButton";
import { PageHero } from "@/components/PageHero";
import { TrustPanel } from "@/components/TrustPanel";
import { areaById, areas, courses, imagePath } from "@/lib/content";
import { absoluteUrl, assetUrl } from "@/lib/site";
import { verificationFor } from "@/lib/verification";

export function generateStaticParams() {
  return areas.map((area) => ({ id: area.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const area = areaById(id);
  if (!area) return {};
  return {
    title: `${area.name}の散歩ガイド`,
    description: area.description,
    alternates: { canonical: absoluteUrl(`areas/${area.id}/`) },
    openGraph: { images: [{ url: absoluteUrl(imagePath(area.image)), width: 1200, height: 900, alt: area.imageAlt }] },
  };
}

export default async function AreaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const area = areaById(id);
  if (!area) notFound();
  const verification = verificationFor("area", area.id);
  if (!verification) notFound();
  const relatedCourses = courses.filter((course) => course.areaId === area.id);

  return (
    <main id="main">
      <PageHero eyebrow={area.ward} title={`${area.name}を歩く`} lead={area.description} crumbs={[{ href: "/areas/", label: "エリア" }, { label: area.name }]} />
      <section className="section">
        <div className="container detail-grid">
          <article>
            <div className="detail-cover">
              <Image src={assetUrl(imagePath(area.image))} alt={area.imageAlt} width={1200} height={900} priority />
              <span className="image-label">イメージ</span>
            </div>
            <FavoriteButton type="area" id={area.id} />
            <TrustPanel verification={verification} />
            <dl className="facts">
              <div><dt>最寄り駅</dt><dd>{area.stations.join("・")}</dd></div>
              <div><dt>散歩時間の目安</dt><dd>{area.duration}</dd></div>
              <div><dt>予算の目安</dt><dd>{area.budget}</dd></div>
              <div><dt>掲載状態</dt><dd>{area.publicationStatus}</dd></div>
            </dl>
            <h2>このエリアのコース</h2>
            <ul>
              {relatedCourses.map((course) => <li key={course.id}><Link href={`/courses/${course.id}/`}>{course.title}</Link></li>)}
            </ul>
          </article>
          <aside className="sidebar-panel">
            <h2>情報について</h2>
            <p>情報確認日：{area.informationCheckedAt || "未記録"}</p>
            <p>現地取材：{area.fieldResearch ? "あり" : "なし"}</p>
            <p>公開情報をもとに編集し、文章整理にAIを利用しています。</p>
            <h3>公式情報源</h3>
            <ul className="source-list">
              {area.officialSources.map((source) => <li key={source.url}><a href={source.url} target="_blank" rel="noreferrer">{source.label}</a></li>)}
            </ul>
            <a className="button button-secondary" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(area.mapQuery)}`} target="_blank" rel="noreferrer">地図で見る</a>
          </aside>
        </div>
      </section>
    </main>
  );
}
