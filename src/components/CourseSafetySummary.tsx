import type { Course } from "@/lib/content";
import { courseSafetySummary } from "@/lib/planner";
import { dateLabel } from "@/lib/verification";

function countLabel(count: number) {
  return count > 0 ? `${count}件` : "情報なし";
}

export function CourseSafetySummary({ course, compact = false }: { course: Course; compact?: boolean }) {
  const summary = courseSafetySummary(course);
  return (
    <section className={`course-safety${compact ? " is-compact" : ""}`} aria-label={`${course.title}の安心情報まとめ`}>
      <h3>{compact ? "安心情報" : "安心情報まとめ"}</h3>
      <dl>
        <div><dt>トイレ情報</dt><dd>{countLabel(summary.toiletCount)}</dd></div>
        <div><dt>食事・カフェ・休憩情報</dt><dd>{countLabel(summary.restCount)}</dd></div>
        <div><dt>駅・交通情報</dt><dd>{countLabel(summary.transitCount)}</dd></div>
        <div><dt>公式情報源</dt><dd>{countLabel(summary.officialSourceCount)}</dd></div>
        {!compact ? <><div><dt>情報確認日</dt><dd>{dateLabel(summary.informationCheckedAt)}</dd></div><div><dt>現地取材</dt><dd>{summary.fieldResearch ? "あり" : "なし"}</dd></div><div><dt>推定情報</dt><dd>{summary.estimated ? "あり" : "なし"}</dd></div><div><dt>再確認</dt><dd>{summary.needsRecheck ? "必要" : "期限内"}</dd></div></> : null}
      </dl>
    </section>
  );
}
