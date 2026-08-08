import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { PlannerClient } from "@/components/PlannerClient";
import { absoluteUrl } from "@/lib/site";

const title = "今日のおさんぽプラン｜時間・予算・気分から東京散歩を選ぶ";
const description = "使える時間、予算、同行者、気分を選び、高円寺・吉祥寺・浅草の散歩コースから条件に合うプランを探せます。";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: absoluteUrl("plan/") },
  openGraph: { title, description, url: absoluteUrl("plan/") },
};

export default function PlanPage() {
  return <main id="main">
    <PageHero eyebrow="TODAY'S SANPO PLAN" title="時間・予算・気分から、今日の散歩コースを選ぶ" lead="使える時間、予算、同行者、気分を選ぶと、現在公開中のコースから条件に近いものを固定ルールでご提案します。" crumbs={[{ label: "今日のおさんぽプラン" }]} />
    <section className="section"><div className="narrow"><ul className="planner-status-row" aria-label="この診断について"><li>確認情報あり</li><li>URL保存・復元対応</li><li>現地取材未実施</li><li>推定情報を含む</li></ul><PlannerClient /><div className="empty-state planner-nojs-fallback"><h2>JavaScriptが無効です</h2><p>診断を利用するにはJavaScriptを有効にしてください。公開中のコースは一覧から確認できます。</p><Link className="button button-primary" href="/courses/">コース一覧を見る</Link></div><script dangerouslySetInnerHTML={{ __html: "document.currentScript.previousElementSibling.hidden=true" }} /></div></section>
  </main>;
}
