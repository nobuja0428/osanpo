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
        <div className="container map-layout">
          <section className="map-embed-panel" aria-label="公開中エリアの地図"><iframe title="公開中エリアの地図" loading="lazy" src="https://www.google.com/maps?q=%E9%AB%98%E5%86%86%E5%AF%BA%20%E5%90%89%E7%A5%A5%E5%AF%BA%20%E6%B5%85%E8%8D%89&output=embed" /><p>地図は参考表示です。経路・営業時間などは各公式情報でご確認ください。</p></section>
          <div className="map-area-list">
            <p className="eyebrow">AVAILABLE AREAS</p><h2>公開中のエリア</h2>
          {areas.map((area) => (
            <article className="card" key={area.id}>
              <div className="card-body">
                <p className="eyebrow">{area.ward}</p>
                <h2>{area.name}</h2>
                <p>{area.lead}</p>
                <a className="button button-primary" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(area.mapQuery)}`} target="_blank" rel="noopener noreferrer" data-analytics-event="google_map_click" data-content-id={area.id}>Googleマップで見る</a>
              </div>
            </article>
          ))}
          </div></div>
      </section>
    </main>
  );
}
