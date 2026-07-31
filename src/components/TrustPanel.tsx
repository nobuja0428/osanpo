import Link from "next/link";
import { dateLabel, isExpired, type ContentVerification } from "@/lib/verification";

export function TrustPanel({ verification }: { verification: ContentVerification }) {
  const expired = isExpired(verification);
  return (
    <section className={expired ? "trust-panel is-expired" : "trust-panel"} aria-label="情報の確認状況">
      <h2>情報の確認状況</h2>
      {expired ? <p className="trust-warning" role="status">この情報は確認期限を過ぎています。訪問前に公式情報をご確認ください。</p> : null}
      <dl className="trust-facts">
        <div><dt>情報確認日</dt><dd>{dateLabel(verification.informationCheckedAt)}</dd></div>
        <div><dt>最終更新日</dt><dd>{dateLabel(verification.lastUpdatedAt)}</dd></div>
        <div><dt>現地取材</dt><dd>{verification.fieldResearch ? "あり" : "実施していません"}</dd></div>
        <div><dt>AI利用</dt><dd>{verification.aiAssisted ? "あり" : "なし"}</dd></div>
        <div><dt>推定情報</dt><dd>{verification.estimated ? "含みます" : "含みません"}</dd></div>
        <div><dt>信頼度</dt><dd>{verification.confidence === "high" ? "高" : verification.confidence === "medium" ? "中" : "低"}</dd></div>
      </dl>
      <p>このページは自治体・施設などの公開情報を基に、AIを使用して編集しています。現地取材は実施していません。料金、営業時間、イベント情報などは、訪問前に公式サイトをご確認ください。</p>
      <h3>公式情報源</h3>
      <ul className="source-list">
        {verification.officialSources.map((source) => <li key={source.url}><a href={source.url} target="_blank" rel="noreferrer">{source.label}</a></li>)}
      </ul>
      <Link href="/editorial-policy/">編集方針と情報の扱い</Link>
    </section>
  );
}
