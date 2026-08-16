import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { FavoriteButton } from "@/components/FavoriteButton";
import { PageHero } from "@/components/PageHero";
import { TrustPanel } from "@/components/TrustPanel";
import { MonetizationSlot } from "@/components/MonetizationSlot";
import { areaById, courses, imagePath, officialSourcesFor, spots, stories, storyById } from "@/lib/content";
import { absoluteUrl, assetUrl } from "@/lib/site";
import { dateLabel, verificationFor } from "@/lib/verification";
import { ContentViewTracker } from "@/components/ContentViewTracker";
import { Fragment } from "react";
import { RelatedContent } from "@/components/RelatedContent";
import { PublicStructuredData } from "@/components/PublicStructuredData";

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
  const storyCharacterCount = story.intro.length + story.sections.reduce((total, section) => total + section.heading.length + section.body.length, 0);
  const showMiddlePlacement = story.sections.length >= 5 || storyCharacterCount >= 1200;
  const middleSectionIndex = Math.ceil(story.sections.length / 2) - 1;
  const relatedCourses = courses.filter((course) => course.areaId === story.areaId).slice(0, 1);
  const relatedSpots = spots.filter((spot) => spot.areaId === story.areaId).slice(0, 2);
  const relatedStories = stories.filter((item) => item.id !== story.id && item.areaId === story.areaId).slice(0, 2);

  return (
    <main id="main">
      <PublicStructuredData type="Article" name={story.title} description={story.excerpt} path={`stories/${story.id}/`} parent={{ name: "読み物", path: "stories/" }} image={imagePath(story.image)} dateModified={verification.lastUpdatedAt} />
      <ContentViewTracker type="story" id={story.id} areaId={story.areaId} />
      <PageHero eyebrow={`${area.name}・${story.category}・${story.readTime}`} title={story.title} lead={story.excerpt} crumbs={[{ href: "/stories/", label: "読み物" }, { label: story.title }]} />
      <section className="section">
        <div className="container detail-grid">
          <article className="article-body">
            <div className="detail-cover">
              <Image src={assetUrl(imagePath(story.image))} alt={story.imageAlt} width={800} height={600} sizes="(max-width: 900px) calc(100vw - 40px), 740px" />
              <span className="image-label">イメージ</span>
            </div>
            <FavoriteButton type="story" id={story.id} />
            <dl className="article-meta" aria-label="記事の更新・確認情報"><div><dt>読了目安</dt><dd>{story.readTime}</dd></div><div><dt>情報確認日</dt><dd>{dateLabel(verification.informationCheckedAt)}</dd></div><div><dt>最終更新日</dt><dd>{dateLabel(verification.lastUpdatedAt)}</dd></div><div><dt>現地取材</dt><dd>{verification.fieldResearch ? "あり" : "実施していません"}</dd></div></dl>
            <p>{story.intro}</p>
            <nav className="article-toc" aria-labelledby="story-toc-heading"><p className="eyebrow">CONTENTS</p><h2 id="story-toc-heading">この記事の目次</h2><ol>{story.sections.map((section, index) => <li key={section.heading}><a href={`#story-section-${index + 1}`}>{section.heading}</a></li>)}</ol></nav>
            {story.sections.map((section, index) => <Fragment key={section.heading}><section id={`story-section-${index + 1}`} className="story-section"><p className="story-section-number">0{index + 1}</p><h2>{section.heading}</h2><p>{section.body}</p></section>{showMiddlePlacement && index === middleSectionIndex ? <MonetizationSlot placement="story-middle" contentId={story.id} areaId={story.areaId} /> : null}</Fragment>)}
            <TrustPanel verification={verification} />
            <MonetizationSlot placement="story-end" contentId={story.id} areaId={story.areaId} />
            <RelatedContent
              eyebrow="WALK THIS STORY"
              title="この街を実際に歩く"
              items={relatedCourses.map((course) => ({ href: `/courses/${course.id}/`, eyebrow: `${area.name}・モデルコース`, title: course.title, description: `${course.duration}・${course.distance}・${course.budget}`, contentId: course.id, areaId: course.areaId }))}
              pageType="story"
              placement="story-related-course"
            />
            <RelatedContent
              eyebrow="STOPS IN THIS STORY AREA"
              title={`${area.name}の関連スポット`}
              items={relatedSpots.map((spot) => ({ href: `/spots/${spot.id}/`, eyebrow: spot.category, title: spot.name, description: spot.excerpt, contentId: spot.id, areaId: spot.areaId }))}
              pageType="story"
              placement="story-related-spots"
            />
            <RelatedContent
              eyebrow="KEEP READING"
              title="同じエリアの読み物"
              items={relatedStories.map((item) => ({ href: `/stories/${item.id}/`, eyebrow: areaById(item.areaId)?.name ?? item.category, title: item.title, description: item.excerpt, contentId: item.id, areaId: item.areaId }))}
              pageType="story"
              placement="story-related-stories"
            />
            <p><Link className="button button-secondary" href={`/areas/${area.id}/`}>{area.name}のエリアガイドへ</Link></p>
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
