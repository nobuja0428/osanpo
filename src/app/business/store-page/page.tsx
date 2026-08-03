import type { Metadata } from "next";
import { BusinessContactCta } from "@/components/BusinessContactCta";
import { BusinessPageView } from "@/components/BusinessPageView";
import { BusinessStructuredData } from "@/components/BusinessStructuredData";
import { PageHero } from "@/components/PageHero";
import { businessServiceById } from "@/content/business";
import { businessMetadata } from "@/lib/business-seo";

const service = businessServiceById("store-page");
const description = "地域のお店の魅力と基本情報を、地図から訪れた人に伝える店舗紹介ページ制作の準備中案内です。";
export const metadata: Metadata = businessMetadata({ title: service.title, description, path: "business/store-page/" });

export default function StorePageService() {
  return <main id="main" className="business-page"><BusinessStructuredData name={service.title} description={description} path="business/store-page/" /><BusinessPageView contentId="store-page" serviceType="store-page" eventName="service_view" />
    <PageHero eyebrow="SERVICE 01" title={service.title} lead={service.description} crumbs={[{ href: "/business/", label: "事業者向け" }, { label: service.title }]} />
    <section className="section"><div className="narrow business-service-content"><p className="business-price">参考価格 {service.price}</p><p>{service.priceNote}</p><h2>地図の次に、知りたいことを伝える</h2><p>営業時間や場所だけでなく、初めて来る人が迷いやすい点、店内やサービスの特徴、来店前に確認したい情報を一つのページに整理します。</p><h2>含める内容の例</h2><ul>{service.deliverables.map((item) => <li key={item}>{item}</li>)}</ul><div className="business-callout"><h2>参考価格</h2><dl className="business-tier-list"><div><dt>基本紹介ページ</dt><dd>30,000円〜</dd></div><div><dt>地図・徒歩導線付き</dt><dd>50,000円〜</dd></div></dl><p>料金は内容により個別見積もりです。検索順位、来店数、売上などの成果を保証するものではありません。</p></div><BusinessContactCta serviceType="store-page" placement="store-page-bottom" /></div></section>
  </main>;
}
