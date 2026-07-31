import type { Metadata } from "next";
import { InfoPage } from "@/components/InfoPage";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "プライバシーポリシー",
  description: "おさんぽクラブ東京のブラウザ保存情報とアクセス解析の方針です。",
  alternates: { canonical: absoluteUrl("privacy/") },
};

export default function PrivacyPage() {
  return (
    <InfoPage eyebrow="PRIVACY" title="プライバシーポリシー" lead="必要以上の利用者情報を収集しない方針です。">
      <h2>お気に入り</h2>
      <p>お気に入りは利用中のブラウザ内にのみ保存され、サーバーには送信しません。</p>
      <h2>アクセス解析</h2>
      <p>現在、GA4測定IDは未設定で、アクセス解析スクリプトは読み込みません。将来有効化する場合も、生の検索語、メールアドレス、問い合わせ本文は独自イベントへ送りません。</p>
      <h2>外部リンク</h2>
      <p>公式サイトや地図など外部サイトのプライバシー方針は、各サービスの定めに従います。</p>
    </InfoPage>
  );
}
