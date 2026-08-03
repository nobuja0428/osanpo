import type { Metadata } from "next";
import Link from "next/link";
import { BusinessPageView } from "@/components/BusinessPageView";
import { BusinessStructuredData } from "@/components/BusinessStructuredData";
import { PageHero } from "@/components/PageHero";
import { businessMetadata } from "@/lib/business-seo";

const title = "自社開発の地域メディア実例";
const description = "おさんぽクラブ東京で実装している、地域情報を地図・徒歩導線・確認状況で整理する仕組みの紹介です。";
const capabilities = ["Next.js", "TypeScript", "スマホ対応", "静的サイト", "Googleマップ埋め込み", "徒歩ルート", "検索・絞り込み", "お気に入り", "SEO", "構造化データ", "アクセシビリティ", "情報確認日", "AI利用表示", "自動品質検査"];
export const metadata: Metadata = businessMetadata({ title, description, path: "business/examples/" });

export default function BusinessExamplesPage() {
  return <main id="main" className="business-page"><BusinessStructuredData name={title} description={description} path="business/examples/" /><BusinessPageView contentId="own-media-example" eventName="example_view" />
    <PageHero eyebrow="OWN DEVELOPMENT" title={title} lead="外部のお客様の事例や成果実績ではなく、このサイト自身に実装している仕組みを技術的な実例として紹介します。" crumbs={[{ href: "/business/", label: "事業者向け" }, { label: "実例" }]} />
    <section className="section"><div className="container"><div className="business-example-grid"><article className="business-example-card"><h2>情報を地図でつなぐ</h2><p>エリア、コース、スポットの情報を、Googleマップへの案内とページ内の地図表示で行き来できるようにしています。</p></article><article className="business-example-card"><h2>歩く順番を伝える</h2><p>コース詳細では、START・立ち寄り地点・GOALの順番と、区間ごとの徒歩ルートへの案内を整理しています。</p></article><article className="business-example-card"><h2>確認状況を表示する</h2><p>公開情報をもとにした内容であること、情報確認日、現地確認の有無を表示して、読み手が判断しやすい形を目指しています。</p></article><article className="business-example-card"><h2>スマホから読みやすくする</h2><p>検索、絞り込み、地図、カードを画面幅に応じて配置し、横スクロールを起こさない基本設計を確認しています。</p></article></div><section className="business-capabilities" aria-labelledby="business-capabilities-title"><p className="eyebrow">IMPLEMENTED CAPABILITIES</p><h2 id="business-capabilities-title">現在のサイトに実装している技術と機能</h2><div className="pills">{capabilities.map((capability) => <span className="pill" key={capability}>{capability}</span>)}</div></section><div className="business-callout"><h2>この実例について</h2><p>ここに掲載しているのは自社開発の地域メディアに関する説明です。取引先名、架空の導入事例、集客・売上などの成果数値は掲載していません。</p><Link className="button button-secondary" href="/" data-analytics-event="example_view" data-page-type="business" data-content-id="osanpo-club" data-placement="business-example-site">実際の地域メディアを見る</Link></div></div></section>
  </main>;
}
