import type { Metadata } from "next";
import Link from "next/link";
import { BusinessContactCta } from "@/components/BusinessContactCta";
import { BusinessListingCta } from "@/components/BusinessListingCta";
import { BusinessPageView } from "@/components/BusinessPageView";
import { BusinessServiceCards } from "@/components/BusinessServiceCards";
import { BusinessStructuredData } from "@/components/BusinessStructuredData";
import { PageHero } from "@/components/PageHero";
import { businessAudience, businessChallenges, businessFaqs } from "@/content/business";
import { businessMetadata } from "@/lib/business-seo";

const title = "地域のお店の魅力を、地図とWebで伝える";
const description = "地域のお店向けに、店舗紹介ページ・Webサイト制作・更新サポートを準備する、おさんぽクラブ東京の事業者向け案内です。";
export const metadata: Metadata = businessMetadata({ title, description, path: "business/" });

export default function BusinessPage() {
  return <main id="main" className="business-page">
    <BusinessStructuredData name={title} description={description} path="business/" /><BusinessPageView contentId="business-home" eventName="pricing_view" />
    <PageHero eyebrow="FOR LOCAL BUSINESSES" title={title} lead="散歩の途中で見つけたくなる情報を、地図と読みやすいWebページで整える相談サービスです。" crumbs={[{ label: "事業者向け" }]} />
    <section className="section"><div className="container business-intro-grid"><div><p className="eyebrow">WHO IT IS FOR</p><h2>地域で商いを続ける方へ</h2><p>場所や営業時間は伝わっていても、お店の雰囲気、来店前に知りたいこと、歩いて向かうきっかけは整理しきれないことがあります。</p><p>おさんぽクラブ東京で積み上げている「地図・散歩・確認情報」の考え方を、店舗やサービスの紹介にも活かすことを目指します。</p><div className="pills" aria-label="対象となる事業者">{businessAudience.map((item) => <span className="pill" key={item}>{item}</span>)}</div></div><aside className="business-note"><h2>まずは小さく整える</h2><p>広告掲載や成果を約束するサービスではありません。掲載内容と目的を確認し、必要な範囲だけを個別に相談して決めます。</p><BusinessContactCta placement="business-home-intro" /></aside></div></section>
    <section className="section section-tint"><div className="container"><div className="section-heading"><div><p className="eyebrow">COMMON CHALLENGES</p><h2>よくある課題</h2></div></div><div className="business-challenge-grid">{businessChallenges.map((challenge, index) => <article className="business-challenge" key={challenge}><strong>{String(index + 1).padStart(2, "0")}</strong><p>{challenge}</p></article>)}</div></div></section>
    <section className="section"><div className="container"><div className="section-heading"><div><p className="eyebrow">SERVICES</p><h2>できること</h2></div></div><BusinessServiceCards /></div></section>
    <section className="section"><div className="container"><div className="section-heading"><div><p className="eyebrow">PROCESS</p><h2>進め方</h2></div></div><ol className="business-process"><li><strong>1. 目的を確認</strong><span>誰に、何を伝えたいかを整理します。</span></li><li><strong>2. 情報を整える</strong><span>掲載内容と優先順位を確認します。</span></li><li><strong>3. 制作・確認</strong><span>スマホを含む表示を確認して公開準備をします。</span></li><li><strong>4. 更新を相談</strong><span>必要な場合だけ、無理のない更新範囲を決めます。</span></li></ol></div></section>
    <section className="section section-tint" id="pricing"><div className="container"><div className="section-heading"><div><p className="eyebrow">PRICING</p><h2>料金の考え方</h2></div></div><div className="business-pricing-grid"><article><strong>単発制作</strong><span>30,000円〜</span><p>店舗紹介ページ、地図・徒歩導線、LP・Webサイトを必要な範囲で個別見積もりします。</p></article><article><strong>Webサイト制作</strong><span>80,000円〜</span><p>1ページLPは80,000円〜、小規模ホームページは120,000円〜の参考価格です。</p></article><article><strong>更新サポート</strong><span>月額5,000円〜</span><p>5,000円・10,000円・15,000円を目安に、契約期間と対応範囲は相談後に決定します。</p></article></div><p className="business-pricing-disclaimer">すべて参考価格です。成果、検索順位、来店数、売上などを保証するものではありません。</p></div></section>
    <section className="section section-tint"><div className="container business-two-column"><div><p className="eyebrow">OWN DEVELOPMENT EXAMPLE</p><h2>自社開発の地域メディア実例</h2><p>この「おさんぽクラブ東京」では、エリア・コース・スポットを地図と徒歩導線でつなぎ、情報の確認状況を表示しています。</p><p>外部のお客様事例や成果実績ではなく、自社で設計・実装している地域メディアの仕組みを確認いただくための実例です。</p><Link className="button button-secondary" href="/business/examples/" data-analytics-event="example_view" data-page-type="business" data-content-id="own-media-example" data-placement="business-home-example">実例を見る</Link></div><div className="business-listing"><p className="eyebrow">FUTURE LISTING</p><h2>無料掲載について</h2><BusinessListingCta /><p>個人情報をこの静的サイト内で受け取ったり、計測に保存したりすることはありません。</p></div></div></section>
    <section className="section"><div className="narrow"><div className="section-heading"><div><p className="eyebrow">FAQ</p><h2>よくある質問</h2></div></div><div className="business-faq">{businessFaqs.map((faq) => <details key={faq.question}><summary>{faq.question}</summary><p>{faq.answer}</p></details>)}</div></div></section>
  </main>;
}
