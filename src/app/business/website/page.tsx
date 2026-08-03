import type { Metadata } from "next";
import { BusinessContactCta } from "@/components/BusinessContactCta";
import { BusinessPageView } from "@/components/BusinessPageView";
import { BusinessStructuredData } from "@/components/BusinessStructuredData";
import { PageHero } from "@/components/PageHero";
import { businessServiceById } from "@/content/business";
import { businessMetadata } from "@/lib/business-seo";

const service = businessServiceById("website");
const description = "地域のお店やサービスの魅力を分かりやすく伝える、Webサイト・LP制作の準備中案内です。";
export const metadata: Metadata = businessMetadata({ title: service.title, description, path: "business/website/" });

export default function WebsiteService() {
  return <main id="main" className="business-page"><BusinessStructuredData name={service.title} description={description} path="business/website/" /><BusinessPageView contentId="website" serviceType="website" eventName="service_view" />
    <PageHero eyebrow="SERVICE 02" title={service.title} lead={service.description} crumbs={[{ href: "/business/", label: "事業者向け" }, { label: service.title }]} />
    <section className="section"><div className="narrow business-service-content"><p className="business-price">参考価格 {service.price}</p><p>{service.priceNote}</p><h2>伝える順番を、Webで整える</h2><p>サービスを知らない人が読んだときにも、何をしているお店か、どんな人に合うか、次に何を確認すればよいかが分かる構成を考えます。</p><h2>含める機能の例</h2><ul>{service.deliverables.map((item) => <li key={item}>{item}</li>)}</ul><div className="business-callout"><h2>参考価格</h2><dl className="business-tier-list"><div><dt>1ページLP</dt><dd>80,000円〜</dd></div><div><dt>小規模ホームページ</dt><dd>120,000円〜</dd></div></dl><p>内容により個別見積もりです。検索順位、集客数、売上などの成果を保証するものではありません。</p></div><BusinessContactCta serviceType="website" placement="website-bottom" /></div></section>
  </main>;
}
