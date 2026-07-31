import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { FavoriteButton } from "@/components/FavoriteButton";
import { PageHero } from "@/components/PageHero";
import { TrustPanel } from "@/components/TrustPanel";
import { MonetizationSlot } from "@/components/MonetizationSlot";
import { areaById, imagePath, officialSourcesFor, spotById, spots } from "@/lib/content";
import { absoluteUrl, assetUrl } from "@/lib/site";
import { verificationFor } from "@/lib/verification";

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

  return (
    <main id="main">
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
            <MonetizationSlot page="spot" placement="near-map-action" />
            <p><Link href={`/areas/${area.id}/`}>{area.name}のエリアガイドへ</Link></p>
          </article>
          <aside className="sidebar-panel">
            <h2>掲載情報について</h2>
            <p>公開情報をもとに編集し、AIによる整理を使用しています。現地取材は未実施です。</p>
            <h3>公式情報源</h3>
            <ul className="source-list">{sources.map((source) => <li key={source.url}><a href={source.url} target="_blank" rel="noreferrer">{source.label}</a></li>)}</ul>
          </aside>
        </div>
      </section>
    </main>
  );
}
