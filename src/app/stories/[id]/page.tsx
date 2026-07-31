import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { FavoriteButton } from "@/components/FavoriteButton";
import { PageHero } from "@/components/PageHero";
import { TrustPanel } from "@/components/TrustPanel";
import { areaById, imagePath, officialSourcesFor, stories, storyById } from "@/lib/content";
import { absoluteUrl, assetUrl } from "@/lib/site";
import { verificationFor } from "@/lib/verification";

export function generateStaticParams() {
  return stories.map((story) => ({ id: story.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const story = storyById(id);
  if (!story) return {};
  return {
    title: story.title,
    description: story.excerpt,
    alternates: { canonical: absoluteUrl(`stories/${story.id}/`) },
    openGraph: { type: "article", images: [{ url: absoluteUrl(imagePath(story.image)), width: 1200, height: 900, alt: story.imageAlt }] },
  };
}

export default async function StoryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const story = storyById(id);
  if (!story) notFound();
  const area = areaById(story.areaId);
  if (!area) notFound();
  const verification = verificationFor("story", story.id);
  if (!verification) notFound();
  const sources = officialSourcesFor(story.areaId);

  return (
    <main id="main">
      <PageHero eyebrow={`${area.name}・${story.category}・${story.readTime}`} title={story.title} lead={story.excerpt} crumbs={[{ href: "/stories/", label: "読み物" }, { label: story.title }]} />
      <section className="section">
        <div className="container detail-grid">
          <article className="article-body">
            <div className="detail-cover">
              <Image src={assetUrl(imagePath(story.image))} alt={story.imageAlt} width={1200} height={900} priority />
              <span className="image-label">イメージ</span>
            </div>
            <FavoriteButton type="story" id={story.id} />
            <TrustPanel verification={verification} />
            <p>{story.intro}</p>
            {story.sections.map((section) => <section key={section.heading}><h2>{section.heading}</h2><p>{section.body}</p></section>)}
            <p><Link className="button button-primary" href={`/areas/${area.id}/`}>{area.name}のエリアガイドへ</Link></p>
          </article>
          <aside className="sidebar-panel">
            <h2>この記事について</h2>
            <p>公開情報をもとに編集し、文章の構成・表現にAIを使用しています。架空の体験談や現地取材済みの表現は使用していません。</p>
            <h3>公式情報源</h3>
            <ul className="source-list">{sources.map((source) => <li key={source.url}><a href={source.url} target="_blank" rel="noreferrer">{source.label}</a></li>)}</ul>
          </aside>
        </div>
      </section>
    </main>
  );
}
