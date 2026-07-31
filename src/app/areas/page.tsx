import type { Metadata } from "next";
import { AreaCard } from "@/components/Cards";
import { PageHero } from "@/components/PageHero";
import { areas } from "@/lib/content";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "東京の散歩エリア",
  description: "高円寺・吉祥寺・浅草の特徴、駅、予算、散歩時間から街を選べます。",
  alternates: { canonical: absoluteUrl("areas/") },
};

export default function AreasPage() {
  return (
    <main id="main">
      <PageHero eyebrow="AREAS" title="エリアから探す" lead="街の雰囲気や最寄り駅から、次に歩きたい東京を見つけましょう。" crumbs={[{ label: "エリア" }]} />
      <section className="section"><div className="container card-grid">{areas.map((area) => <AreaCard area={area} key={area.id} />)}</div></section>
    </main>
  );
}
