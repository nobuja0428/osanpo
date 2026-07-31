import type { Metadata } from "next";
import { FavoritesClient } from "@/components/FavoritesClient";
import { PageHero } from "@/components/PageHero";

export const metadata: Metadata = {
  title: "お気に入り",
  robots: { index: false, follow: true },
};

export default function FavoritesPage() {
  return (
    <main id="main">
      <PageHero eyebrow="FAVORITES" title="お気に入り" lead="このブラウザに保存した散歩候補をまとめて確認できます。" crumbs={[{ label: "お気に入り" }]} />
      <section className="section"><div className="container"><FavoritesClient /></div></section>
    </main>
  );
}
