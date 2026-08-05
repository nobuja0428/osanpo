import type { Metadata } from "next";
import { MapExplorer } from "@/components/MapExplorer";
import { PageHero } from "@/components/PageHero";
import { areas, courses, spots } from "@/lib/content";
import { absoluteUrl } from "@/lib/site";
import { verificationFor } from "@/lib/verification";

export const metadata: Metadata = {
  title: "地図から散歩エリアを探す",
  description: "高円寺・吉祥寺・浅草の散歩エリア、コース、スポットをページ内の地図で確認できます。",
  alternates: { canonical: absoluteUrl("map/") },
};

export default function MapPage() {
  return <main id="main">
    <PageHero eyebrow="MAP" title="地図から探す" lead="公開中の3エリアを選び、関連コースと主なスポットを確認できます。地図は参考表示です。" crumbs={[{ label: "地図" }]} />
    <section className="section map-page-section"><div className="container"><MapExplorer areaItems={areas.map(({ id, name, ward, lead, description, mapQuery }) => ({ id, name, ward, lead, description, mapQuery, informationCheckedAt: verificationFor("area", id)?.informationCheckedAt ?? "未記録" }))} courseItems={courses} spotItems={spots.map(({ id, areaId, name, mapQuery }) => ({ id, areaId, name, mapQuery }))} /></div></section>
  </main>;
}
