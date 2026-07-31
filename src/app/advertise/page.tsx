import type { Metadata } from "next";
import { InfoPage } from "@/components/InfoPage";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "広告掲載・地域パートナー",
  description: "おさんぽクラブ東京の広告掲載と地域パートナー募集の準備状況です。",
  alternates: { canonical: absoluteUrl("advertise/") },
};

export default function AdvertisePage() {
  return (
    <InfoPage eyebrow="PARTNERS" title="広告掲載・地域パートナー" lead="現在は募集開始前の準備段階です。">
      <h2>準備状況</h2>
      <ul>
        <li>地域パートナー募集準備中</li>
        <li>媒体資料準備中</li>
        <li>アクセス実績を蓄積中</li>
      </ul>
      <p>料金、実績、広告主は未定です。問い合わせ先も未設定のため、申込ボタンは表示していません。</p>
    </InfoPage>
  );
}
