"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { FavoriteButton } from "@/components/FavoriteButton";
import { trackEvent } from "@/components/Analytics";
import { areas, courses, imagePath } from "@/lib/content";
import { mapDirectionsUrl } from "@/lib/maps";
import { assetUrl } from "@/lib/site";
import { emptyPlanCriteria, moodLabels, parsePlanCriteria, planCriteriaSearch, rankCourses, type PlanAssurance, type PlanCriteria } from "@/lib/planner";
import { dateLabel } from "@/lib/verification";

const questions = ["使える時間", "予算", "誰と歩くか", "今日の気分", "安心情報"];
const durationOptions = [["60", "60分以内"], ["90", "90分以内"], ["120", "2時間以内"], ["180", "3時間以内"], ["any", "時間を気にしない"]];
const budgetOptions = [["1000", "1,000円以内"], ["3000", "3,000円以内"], ["5000", "5,000円以内"], ["any", "指定しない"]];
const audienceOptions = [["solo", "ひとり"], ["friends", "友人"], ["date", "デート"], ["family", "家族"], ["any", "指定しない"]];
const moodOptions = [["history", "歴史"], ["shopping", "商店街・買い物"], ["vintage", "古着・路地"], ["nature", "自然"], ["cafe", "カフェ"], ["any", "指定しない"]];
const assuranceOptions: [PlanAssurance, string][] = [["rest", "休憩候補がある"], ["toilet", "トイレ情報がある"], ["transit", "駅・交通情報がある"], ["verified", "情報確認状況を表示してほしい"]];

function hasAnyCondition(criteria: PlanCriteria) {
  return Boolean(criteria.duration || criteria.budget || criteria.audience || criteria.mood || criteria.assurances.length);
}

export function PlannerClient() {
  const [criteria, setCriteria] = useState<PlanCriteria>(emptyPlanCriteria());
  const [step, setStep] = useState(0);
  const recommendations = useMemo(() => rankCourses(courses, criteria).slice(0, 3), [criteria]);

  useEffect(() => {
    const restore = (event?: PopStateEvent) => {
      const restored = parsePlanCriteria(window.location.search);
      setCriteria(restored);
      const historyStep = event?.state?.planStep;
      setStep(Number.isInteger(historyStep) && historyStep >= 0 && historyStep <= questions.length ? historyStep : hasAnyCondition(restored) ? questions.length : 0);
    };
    restore();
    const handlePopState = (event: PopStateEvent) => restore(event);
    window.addEventListener("popstate", handlePopState);
    trackEvent("plan_start", { placement: "plan-page" });
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    if (step !== questions.length) return;
    trackEvent("plan_result_view", { result_count: recommendations.length, duration_range: criteria.duration ?? "", budget_range: criteria.budget ?? "", audience_type: criteria.audience ?? "", mood_type: criteria.mood ?? "", placement: "plan-results" });
  }, [criteria, recommendations.length, step]);

  function write(next: PlanCriteria) {
    setCriteria(next);
    const search = planCriteriaSearch(next);
    window.history.pushState({ planStep: step }, "", `${window.location.pathname}${search ? `?${search}` : ""}`);
    trackEvent("plan_condition_change", { duration_range: next.duration ?? "", budget_range: next.budget ?? "", audience_type: next.audience ?? "", mood_type: next.mood ?? "", placement: `plan-step-${step + 1}` });
  }

  function select(key: "duration" | "budget" | "audience" | "mood", value: string) {
    write({ ...criteria, [key]: value });
  }

  function toggleAssurance(value: PlanAssurance) {
    const assurances = criteria.assurances.includes(value) ? criteria.assurances.filter((item) => item !== value) : [...criteria.assurances, value];
    write({ ...criteria, assurances });
  }

  function reset() {
    const next = emptyPlanCriteria();
    setCriteria(next);
    setStep(0);
    window.history.pushState({ planStep: 0 }, "", window.location.pathname);
  }

  function showResults() {
    const search = planCriteriaSearch(criteria);
    window.history.pushState({ planStep: questions.length }, "", `${window.location.pathname}${search ? `?${search}` : ""}`);
    setStep(questions.length);
  }

  const selectedSummary = [
    criteria.duration && durationOptions.find(([value]) => value === criteria.duration)?.[1],
    criteria.budget && budgetOptions.find(([value]) => value === criteria.budget)?.[1],
    criteria.audience && audienceOptions.find(([value]) => value === criteria.audience)?.[1],
    criteria.mood && moodOptions.find(([value]) => value === criteria.mood)?.[1],
    ...criteria.assurances.map((value) => assuranceOptions.find(([key]) => key === value)?.[1]),
  ].filter(Boolean);

  if (step === questions.length) return (
    <div className="planner-results">
      <div className="planner-result-heading"><div><p className="eyebrow">YOUR SANPO PLAN</p><h2>今日のおさんぽ候補</h2><p>{selectedSummary.length ? `選択中：${selectedSummary.join("・")}` : "条件を指定せず、公開中のコースをご案内しています。"}</p></div><button className="button button-secondary" type="button" onClick={reset}>最初からやり直す</button></div>
      <div className="planner-result-list">{recommendations.map(({ course, completeMatch, reasons, safety }, index) => {
        const area = areas.find((item) => item.id === course.areaId);
        const routeQueries = course.routeStops.map((stop) => stop.query);
        return <article className="planner-result-card" key={course.id}>
          <div className="planner-result-rank">候補 {index + 1}</div>
          <div className="planner-result-media"><Image src={assetUrl(imagePath(course.image))} alt={course.imageAlt} width={800} height={600} sizes="(max-width: 700px) calc(100vw - 40px), 340px" /><span className="image-label">イメージ</span></div>
          <div className="planner-result-body"><p className="eyebrow">{area?.name}</p><h3>{course.title}</h3>{completeMatch ? null : <p className="plan-partial-match">一部の条件とは一致しません</p>}
            <dl className="planner-facts"><div><dt>所要時間</dt><dd>{course.duration}</dd></div><div><dt>距離</dt><dd>{course.distance}</dd></div><div><dt>予算</dt><dd>{course.budget}</dd></div><div><dt>対象者</dt><dd>{course.audience}</dd></div><div><dt>テーマ</dt><dd>{course.moodKeys.map((key) => moodLabels[key]).join("・")}</dd></div></dl>
            <div className="course-card-route"><p><span className="route-label is-start">START</span><strong>{course.routeStops[0]?.name}</strong></p><p><span className="route-label is-goal">GOAL</span><strong>{course.routeStops.at(-1)?.name}</strong></p></div>
            <section className="plan-reasons"><h4>おすすめした理由</h4><ul>{reasons.map((reason) => <li key={reason}>{reason}</li>)}</ul></section>
            <p className="plan-verification">情報確認日：{dateLabel(safety.informationCheckedAt)}／現地取材：{safety.fieldResearch ? "あり" : "なし"}／推定情報：{safety.estimated ? "あり" : "なし"}／再確認：{safety.needsRecheck ? "必要" : "期限内"}</p>
            <FavoriteButton type="course" id={course.id} />
            <div className="planner-actions"><Link className="button button-primary" href={`/courses/${course.id}/`} data-analytics-event="plan_course_click" data-content-id={course.id} data-area-id={course.areaId} data-placement="plan-result-detail">詳細を見る</Link><Link className="button button-secondary" href={`/courses/${course.id}/#course-customizer`} data-analytics-event="route_customize_start" data-content-id={course.id} data-area-id={course.areaId} data-placement="plan-result-customize">このコースを調整する</Link><a className="button button-secondary" href={mapDirectionsUrl(routeQueries)} target="_blank" rel="noopener noreferrer" data-analytics-event="custom_route_click" data-content-id={course.id} data-area-id={course.areaId} data-selected-stop-count={course.routeStops.length} data-placement="plan-result-route">Googleマップで徒歩ルートを開く <span aria-hidden="true">↗</span></a></div>
          </div>
        </article>;
      })}</div>
    </div>
  );

  const optionGroup = (key: "duration" | "budget" | "audience" | "mood", options: string[][]) => <div className="planner-options">{options.map(([value, label]) => <button className={criteria[key] === value ? "is-selected" : ""} type="button" aria-pressed={criteria[key] === value} key={value} onClick={() => select(key, value)}>{label}</button>)}</div>;
  return (
    <section className="planner-panel" aria-labelledby="planner-question">
      <div className="planner-progress" role="progressbar" aria-label="コース診断の進捗" aria-valuemin={1} aria-valuemax={questions.length} aria-valuenow={step + 1} aria-valuetext={`5問中${step + 1}問目`}><span style={{ width: `${((step + 1) / questions.length) * 100}%` }} /></div>
      <p className="eyebrow">30秒コース診断・{step + 1}/5</p><h2 id="planner-question">質問{step + 1}：{questions[step]}</h2>
      {selectedSummary.length ? <p className="planner-current">現在の選択：{selectedSummary.join("・")}</p> : <p className="planner-current">まだ条件を選択していません。</p>}
      {step === 0 ? optionGroup("duration", durationOptions) : null}
      {step === 1 ? optionGroup("budget", budgetOptions) : null}
      {step === 2 ? optionGroup("audience", audienceOptions) : null}
      {step === 3 ? optionGroup("mood", moodOptions) : null}
      {step === 4 ? <fieldset className="planner-assurances"><legend>希望する項目を複数選べます</legend>{assuranceOptions.map(([value, label]) => <label key={value}><input type="checkbox" checked={criteria.assurances.includes(value)} onChange={() => toggleAssurance(value)} /> <span>{label}</span></label>)}</fieldset> : null}
      <div className="planner-navigation">{step > 0 ? <button className="button button-secondary" type="button" onClick={() => setStep(step - 1)}>戻る</button> : <button className="button button-secondary" type="button" onClick={reset}>条件をすべて解除</button>}<button className="button button-primary" type="button" onClick={step === questions.length - 1 ? showResults : () => setStep(step + 1)}>{step === questions.length - 1 ? "結果を見る" : "次へ"}</button></div>
    </section>
  );
}
