import type { Metadata } from "next";
import { InfoPage } from "@/components/InfoPage";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "編集方針",
  description: "公式情報、AI利用、現地取材、画像、推定情報に関する編集方針です。",
  alternates: { canonical: absoluteUrl("editorial-policy/") },
};

export default function EditorialPolicyPage() {
  return (
    <InfoPage eyebrow="EDITORIAL POLICY" title="編集方針" lead="確認できた事実と、編集上の提案・イメージを区別します。">
      <h2>情報の作成方法</h2>
      <p>おさんぽクラブ東京は、自治体、施設、主催者などが公開している情報、オープンデータ、公式サイトを基に編集しています。</p>
      <h2>AI利用と現地取材</h2>
      <p>記事制作と情報整理にはAIを使用しています。原則として現地取材は行っておらず、実際に歩いた体験談としては記載しません。</p>
      <h2>画像</h2>
      <p>掲載画像にはAI生成のイメージ素材を含みます。「イメージ」と表示し、実在店舗やイベントの記録写真として扱いません。</p>
      <h2>訪問前の確認</h2>
      <p>営業時間、料金、イベント開催状況、交通情報などは、訪問前に必ず公式情報をご確認ください。</p>
    </InfoPage>
  );
}
