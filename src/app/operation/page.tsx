import type { Metadata } from "next";
import { InfoPage } from "@/components/InfoPage";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "運営情報",
  description: "おさんぽクラブ東京の運営状況と外部サービス設定を案内します。",
  alternates: { canonical: absoluteUrl("operation/") },
};

export default function OperationPage() {
  return (
    <InfoPage eyebrow="OPERATION" title="運営情報" lead="安全に公開できる設定だけを有効にしています。">
      <h2>現在の運営状態</h2>
      <ul>
        <li>掲載エリア：高円寺・吉祥寺・浅草</li>
        <li>イベント更新：手動確認</li>
        <li>GA4：未設定</li>
        <li>お問い合わせ先：未設定</li>
        <li>広告・アフィリエイト：未設定</li>
      </ul>
      <h2>外部サービス</h2>
      <p>測定ID、問い合わせ先、広告リンクなどは、実在する設定が用意できた場合にだけ有効化します。</p>
    </InfoPage>
  );
}
