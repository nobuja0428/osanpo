import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { SearchClient } from "@/components/SearchClient";

export const metadata: Metadata = {
  title: "サイト内検索",
  description: "エリア、コース、スポット、読み物を横断検索します。",
  robots: { index: false, follow: true },
};

export default function SearchPage() {
  return (
    <main id="main">
      <PageHero eyebrow="SEARCH" title="サイト内検索" lead="街、コース、スポット、読み物をまとめて検索できます。" crumbs={[{ label: "検索" }]} />
      <section className="section"><div className="container"><SearchClient /></div></section>
    </main>
  );
}
