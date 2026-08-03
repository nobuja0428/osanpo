import type { Metadata } from "next";
import { BusinessContactCta } from "@/components/BusinessContactCta";
import { BusinessPageView } from "@/components/BusinessPageView";
import { BusinessStructuredData } from "@/components/BusinessStructuredData";
import { PageHero } from "@/components/PageHero";
import { businessServiceById } from "@/content/business";
import { businessMetadata } from "@/lib/business-seo";

const service = businessServiceById("support");
const description = "地域のお店向けの、Webページ更新と情報整理の相談を続けるための運用サポート準備中案内です。";
export const metadata: Metadata = businessMetadata({ title: service.title, description, path: "business/support/" });

export default function SupportService() {
  return <main id="main" className="business-page"><BusinessStructuredData name={service.title} description={description} path="business/support/" /><BusinessPageView contentId="support" serviceType="support" eventName="service_view" />
    <PageHero eyebrow="SERVICE 03" title={service.title} lead={service.description} crumbs={[{ href: "/business/", label: "事業者向け" }, { label: service.title }]} />
    <section className="section"><div className="narrow business-service-content"><p className="business-price">参考価格 {service.price}</p><p>{service.priceNote}</p><h2>公開後に困らないための小さな支え</h2><p>更新の頻度や内容は、お店ごとに異なります。必要なときだけ相談できるよう、対応範囲を先に確認してから進めます。</p><h2>相談できる内容の例</h2><ul>{service.deliverables.map((item) => <li key={item}>{item}</li>)}</ul><div className="business-callout"><h2>月額の参考価格</h2><dl className="business-tier-list"><div><dt>軽微な情報更新</dt><dd>月5,000円〜</dd></div><div><dt>更新・簡易レポート</dt><dd>月10,000円〜</dd></div><div><dt>継続改善支援</dt><dd>月15,000円〜</dd></div></dl><p>契約期間と対応範囲は相談後に決定します。対応時間や成果を約束するものではありません。</p></div><BusinessContactCta serviceType="support" placement="support-bottom" /></div></section>
  </main>;
}
