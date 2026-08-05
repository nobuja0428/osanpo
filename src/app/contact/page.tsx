import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage } from "@/components/InfoPage";
import { absoluteUrl } from "@/lib/site";
import { businessContactEmail, emailContactHref } from "@/content/business";

export const metadata: Metadata = {
  title: "お問い合わせ",
  description: "おさんぽクラブ東京へのお問い合わせをメールで受け付けています。",
  alternates: { canonical: absoluteUrl("contact/") },
};

export default function ContactPage() {
  return (
    <InfoPage eyebrow="CONTACT" title="お問い合わせ" lead="メールでお問い合わせを受け付けています。">
      <h2>メールでお問い合わせください</h2>
      <p>一般的なご質問や掲載情報について、公開用メールアドレスで受け付けています。</p>
      <p><a className="button button-primary" href={emailContactHref("general")} data-analytics-event="contact_cta_click" data-page-type="contact" data-content-id="general-contact" data-contact-type="general" data-placement="contact-page">メールを作成する</a></p>
      <p className="contact-address">送信先：<span>{businessContactEmail}</span></p>
      <ul className="contact-guidance">
        <li>返信は2〜3営業日以内を目安としています。</li>
        <li>内容によっては返信できない場合があります。</li>
        <li>営業目的の一斉送信はお断りします。</li>
        <li>氏名・住所などの個人情報は、必要以上に記載しないでください。</li>
      </ul>
      <p><Link className="button button-secondary" href="/operation/">運営情報を見る</Link></p>
    </InfoPage>
  );
}
