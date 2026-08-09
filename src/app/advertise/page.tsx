import type { Metadata } from "next";
import { InfoPage } from "@/components/InfoPage";
import { BusinessContactCta } from "@/components/BusinessContactCta";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "広告掲載・地域パートナー",
  description: "おさんぽクラブ東京の広告掲載と地域パートナー募集の準備状況です。",
  alternates: { canonical: absoluteUrl("advertise/") },
};

export default function AdvertisePage() {
  return (
    <InfoPage eyebrow="PARTNERS" title="広告掲載・地域パートナー" lead="実広告の配信は行わず、掲載方法を個別に確認する相談のみ受け付けています。">
      <h2>準備状況</h2>
      <ul>
        <li>広告・スポンサー表示基盤を準備済み</li>
        <li>現在の広告・スポンサー・アフィリエイト掲載は0件</li>
        <li>媒体資料準備中</li>
        <li>料金と掲載条件は未定</li>
      </ul>
      <p>地域のお店やサービスとの掲載・スポンサー相談は、内容や掲載方法を個別に確認したうえでご案内します。成果、検索順位、来店数、売上などは保証しません。</p>
      <BusinessContactCta placement="advertise-sponsor-consultation" label="スポンサー掲載について相談する" />
    </InfoPage>
  );
}
