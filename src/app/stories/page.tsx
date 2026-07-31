import type { Metadata } from "next";
import { StoryCard } from "@/components/Cards";
import { PageHero } from "@/components/PageHero";
import { stories } from "@/lib/content";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "東京の街歩き読み物",
  description: "高円寺・吉祥寺・浅草を歩く前に読みたい、短い街歩きガイドです。",
  alternates: { canonical: absoluteUrl("stories/") },
};

export default function StoriesPage() {
  return (
    <main id="main">
      <PageHero eyebrow="STORIES" title="街の読み物" lead="街の見どころを短く予習できる、散歩前の読み物です。" crumbs={[{ label: "読み物" }]} />
      <section className="section"><div className="container card-grid">{stories.map((story) => <StoryCard story={story} key={story.id} />)}</div></section>
    </main>
  );
}
