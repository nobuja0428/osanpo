import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage } from "@/components/InfoPage";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "はじめての方へ",
  description: "おさんぽクラブ東京の使い方と掲載方針を紹介します。",
  alternates: { canonical: absoluteUrl("about/") },
};

export default function AboutPage() {
  return (
    <InfoPage eyebrow="ABOUT" title="はじめての方へ" lead="時間や予算から、今日の東京散歩を決めるためのサイトです。">
      <h2>使い方</h2>
      <p>コース検索で時間、予算、同行者、気分を選ぶと、条件に合う散歩コースだけを表示できます。</p>
      <p><Link className="button button-primary" href="/courses/">コースを探す</Link></p>
      <h2>掲載エリア</h2>
      <p>現在は高円寺・吉祥寺・浅草の3エリアを掲載しています。確認済み情報を用意できた街から段階的に追加します。</p>
      <h2>情報の確認</h2>
      <p>営業情報、料金、交通、イベントは変わる場合があります。訪問前に各公式サイトをご確認ください。</p>
    </InfoPage>
  );
}
