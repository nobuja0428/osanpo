import type { Metadata } from "next";
import { BusinessContactCta } from "@/components/BusinessContactCta";
import { BusinessPageView } from "@/components/BusinessPageView";
import { BusinessStructuredData } from "@/components/BusinessStructuredData";
import { PageHero } from "@/components/PageHero";
import { businessMetadata } from "@/lib/business-seo";

const title = "掲載・制作のご相談";
const description = "おさんぽクラブ東京の店舗掲載、店舗紹介、地図・徒歩導線、Webサイト制作、更新サポートに関する相談窓口です。";
export const metadata: Metadata = businessMetadata({ title, description, path: "business/contact/" });

export default function BusinessContactPage() {
  return <main id="main" className="business-page"><BusinessStructuredData name={title} description={description} path="business/contact/" /><BusinessPageView contentId="business-contact" />
    <PageHero eyebrow="CONTACT" title={title} lead="店舗掲載、店舗紹介、地図・徒歩導線、Web・LP制作、更新支援の相談をGoogleフォームで受け付けています。" crumbs={[{ href: "/business/", label: "事業者向け" }, { label: "ご相談" }]} />
    <section className="section"><div className="narrow business-service-content"><h2>Googleフォームでご相談ください</h2><p>送信内容はこの静的サイトやアクセス解析には保存しません。</p><BusinessContactCta placement="business-contact-page" /><ul className="contact-guidance"><li>返信は2〜3営業日以内を目安としています。</li><li>内容によっては返信できない場合があります。</li><li>営業目的の一斉送信はお断りします。</li><li>個人情報は必要以上に記載しないでください。</li></ul></div></section>
  </main>;
}
