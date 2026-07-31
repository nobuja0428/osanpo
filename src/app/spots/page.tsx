import type { Metadata } from "next";
import { SpotCard } from "@/components/Cards";
import { PageHero } from "@/components/PageHero";
import { spots } from "@/lib/content";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "東京の散歩スポット",
  description: "高円寺・吉祥寺・浅草で散歩の途中に立ち寄りたいスポットを紹介します。",
  alternates: { canonical: absoluteUrl("spots/") },
};

export default function SpotsPage() {
  return (
    <main id="main">
      <PageHero eyebrow="SPOTS" title="立ち寄りスポット" lead="公園、寺社、商店街、文化施設。散歩に組み込みやすい場所をまとめています。" crumbs={[{ label: "スポット" }]} />
      <section className="section"><div className="container card-grid">{spots.map((spot) => <SpotCard spot={spot} key={spot.id} />)}</div></section>
    </main>
  );
}
