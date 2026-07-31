import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { areas } from "@/lib/content";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "地図から散歩エリアを探す",
  description: "高円寺・吉祥寺・浅草をGoogleマップで確認できます。",
  alternates: { canonical: absoluteUrl("map/") },
};

export default function MapPage() {
  return (
    <main id="main">
      <PageHero eyebrow="MAP" title="地図から探す" lead="APIキー不要の外部地図リンクで、各エリアの位置を確認できます。" crumbs={[{ label: "地図" }]} />
      <section className="section">
        <div className="container card-grid">
          {areas.map((area) => (
            <article className="card" key={area.id}>
              <div className="card-body">
                <p className="eyebrow">{area.ward}</p>
                <h2>{area.name}</h2>
                <p>{area.lead}</p>
                <a className="button button-primary" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(area.mapQuery)}`} target="_blank" rel="noreferrer">Googleマップで見る</a>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
