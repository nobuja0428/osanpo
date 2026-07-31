import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage } from "@/components/InfoPage";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "お問い合わせ",
  description: "おさんぽクラブ東京のお問い合わせ準備状況です。",
  alternates: { canonical: absoluteUrl("contact/") },
};

export default function ContactPage() {
  return (
    <InfoPage eyebrow="CONTACT" title="お問い合わせ" lead="現在、お問い合わせ受付を準備中です。">
      <h2>受付方法は未設定です</h2>
      <p>公開用メールアドレスまたは外部フォームが安全に用意できるまで、送信ボタンや架空の連絡先は表示しません。</p>
      <p><Link className="button button-secondary" href="/operation/">運営情報を見る</Link></p>
    </InfoPage>
  );
}
