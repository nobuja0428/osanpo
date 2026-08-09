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
    <InfoPage eyebrow="PARTNERS" title="広告掲載・地域パートナー" lead="地域スポンサーを募集中です。掲載内容や期間を確認し、個別にご案内します。">
      <h2>広告掲載について</h2>
      <ul>
        <li>地域スポンサー</li>
        <li>店舗掲載</li>
        <li>Web・LP制作</li>
        <li>将来のディスプレイ広告</li>
      </ul>
      <p>掲載内容・掲載期間を確認したうえで個別にご案内します。成果、検索順位、来店数、売上などは保証しません。</p>
      <BusinessContactCta placement="advertise-sponsor-consultation" label="スポンサー掲載について相談する" />
    </InfoPage>
  );
}
