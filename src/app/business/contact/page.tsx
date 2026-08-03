import type { Metadata } from "next";
import { BusinessContactCta } from "@/components/BusinessContactCta";
import { BusinessPageView } from "@/components/BusinessPageView";
import { BusinessStructuredData } from "@/components/BusinessStructuredData";
import { PageHero } from "@/components/PageHero";
import { businessContact } from "@/content/business";
import { businessMetadata } from "@/lib/business-seo";

const title = "掲載・制作のご相談";
const description = "おさんぽクラブ東京の店舗紹介ページ制作、Webサイト制作、更新サポートに関するお問い合わせ準備状況です。";
export const metadata: Metadata = businessMetadata({ title, description, path: "business/contact/" });

export default function BusinessContactPage() {
  return <main id="main" className="business-page"><BusinessStructuredData name={title} description={description} path="business/contact/" /><BusinessPageView contentId="business-contact" />
    <PageHero eyebrow="CONTACT" title={title} lead="受付方法を安全に設定できるまで、入力フォーム・送信ボタン・架空の連絡先は表示しません。" crumbs={[{ href: "/business/", label: "事業者向け" }, { label: "ご相談" }]} />
    <section className="section"><div className="narrow business-service-content"><h2>{businessContact ? "ご相談を受け付けています" : "受付準備中です"}</h2>{businessContact ? <><p>外部フォームまたは公開用メールアドレスでご相談を受け付けます。送信内容はこの静的サイトや計測には保存しません。</p><BusinessContactCta placement="business-contact-page" label="相談方法を開く" /></> : <><p>公開用メールアドレスまたはGoogleフォームを設定するまで、個人情報を入力する欄や連絡ボタンは表示しません。</p><p className="business-contact-pending" role="status">受付準備中</p></>}</div></section>
  </main>;
}
