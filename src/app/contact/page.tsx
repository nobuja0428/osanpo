import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage } from "@/components/InfoPage";
import { absoluteUrl } from "@/lib/site";
import { businessContactEmail, businessContactFormUrl, emailContactHref } from "@/content/business";

export const metadata: Metadata = {
  title: "お問い合わせ",
  description: "おさんぽクラブ東京へのお問い合わせをGoogleフォームで受け付けています。",
  alternates: { canonical: absoluteUrl("contact/") },
};

export default function ContactPage() {
  return (
    <InfoPage eyebrow="CONTACT" title="お問い合わせ" lead="一般・掲載・制作のご相談をGoogleフォームで受け付けています。">
      <h2>お問い合わせフォーム</h2>
      <p>一般的なご質問や掲載情報、店舗紹介・地図導線・Web制作・更新支援についてご相談いただけます。</p>
      <p><a className="button button-primary" href={businessContactFormUrl} target="_blank" rel="noopener noreferrer" data-analytics-event="contact_form_open" data-page-type="contact" data-content-id="general-contact" data-contact-type="general" data-placement="contact-page">お問い合わせフォームを開く <span aria-hidden="true">↗</span></a></p>
      <h2>フォームを利用できない場合</h2>
      <p>補助手段としてメールをご利用ください。</p>
      <p><a className="button button-secondary" href={emailContactHref("general")} data-analytics-event="contact_cta_click" data-page-type="contact" data-content-id="general-contact" data-contact-type="general" data-placement="contact-email-fallback">メールを作成する</a></p>
      <p className="contact-address">補助メール：<span>{businessContactEmail}</span></p>
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
