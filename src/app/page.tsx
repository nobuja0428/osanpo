import Link from "next/link";
import Image from "next/image";
import { AreaCard, SpotCard, StoryCard } from "@/components/Cards";
import { CourseCardCollection } from "@/components/CourseCardCollection";
import { HeroSearch } from "@/components/HeroSearch";
import { areas, courses, events, spots, stories } from "@/lib/content";
import { isRecommendedEvent } from "@/lib/events";
import { assetUrl } from "@/lib/site";
import { dateLabel, verificationCatalog } from "@/lib/verification";
import { MonetizationSlot } from "@/components/MonetizationSlot";
import { MapEmbed } from "@/components/MapEmbed";

const quickChoices = [
  { href: "/plan/?duration=120", label: "2時間以内", note: "短めに歩く" },
  { href: "/plan/?duration=180", label: "半日", note: "3時間以内" },
  { href: "/plan/?budget=3000", label: "予算3,000円以内", note: "予算から選ぶ" },
  { href: "/plan/?audience=solo", label: "ひとり", note: "自分のペースで" },
  { href: "/plan/?audience=date", label: "デート", note: "ふたりで歩く" },
  { href: "/plan/?mood=nature", label: "自然", note: "緑や水辺へ" },
] as const;

const themeDefinitions = [
  { key: "history", label: "歴史を歩く", description: "寺社や門前町をたどる" },
  { key: "shopping", label: "商店街を歩く", description: "買い物と街の生活を楽しむ" },
  { key: "vintage", label: "古着と路地", description: "店と横道を寄り道する" },
  { key: "nature", label: "自然のそばを歩く", description: "公園や水辺でひと息つく" },
  { key: "cafe", label: "カフェのある散歩", description: "休憩を挟んでゆっくり歩く" },
] as const;

const conditionLandingByTheme: Partial<Record<(typeof themeDefinitions)[number]["key"], string>> = {
  shopping: "/courses/conditions/shopping/",
};

const contentNames = new Map<string, string>([
  ...areas.map((item): [string, string] => [`area:${item.id}`, item.name]),
  ...courses.map((item): [string, string] => [`course:${item.id}`, item.title]),
  ...spots.map((item): [string, string] => [`spot:${item.id}`, item.name]),
  ...stories.map((item): [string, string] => [`story:${item.id}`, item.title]),
]);

export default function HomePage() {
  const currentEvents = events.filter((event) => isRecommendedEvent(event)).slice(0, 4);
  const themes = themeDefinitions.map((theme) => ({
    ...theme,
    count: courses.filter((course) => course.moodKeys.includes(theme.key)).length,
  })).filter((theme) => theme.count > 0);
  const updates = Object.entries(verificationCatalog)
    .filter(([key]) => !key.startsWith("event:"))
    .sort(([, a], [, b]) => b.lastUpdatedAt.localeCompare(a.lastUpdatedAt))
    .slice(0, 5);

  return (
    <main id="main">
      <section className="hero hero-complete">
        <div className="container hero-complete-inner">
          <div className="hero-overlay">
            <p className="eyebrow">TOKYO SANPO CLUB</p>
            <h1>東京を、もっと歩きたくなる。</h1>
            <p className="hero-lead">時間・予算・気分から、今日歩く東京のコースを選べます。</p>
            <div className="hero-actions hero-primary-actions"><Link href="/plan/" className="button button-accent">今日のおさんぽを選ぶ</Link><Link href="/courses/" className="button button-secondary">コースから探す</Link></div>
            <div className="hero-sub-links"><Link href="/plan/">30秒コース診断</Link><Link href="/about/">はじめての方へ</Link></div>
          </div>
          <div className="hero-visual"><Image className="hero-background" src={assetUrl("assets/images/hero/hero-tokyo-walk.webp")} width={960} height={540} sizes="(max-width: 700px) 100vw, 45vw" alt="東京の街歩きを表現したイメージ" preload fetchPriority="high" decoding="sync" /><span className="image-label">イメージ</span></div>
        </div>
      </section>

      <section className="section home-choice-section" aria-labelledby="home-choice-heading"><div className="container">
        <div className="section-heading home-choice-heading"><div><p className="eyebrow">CHOOSE TODAY&apos;S WALK</p><h2 id="home-choice-heading">今日のおさんぽを選ぶ</h2><p>迷ったら診断、決まっている条件があれば近道から。公開中のコースだけをご案内します。</p></div></div>
        <div className="home-choice-grid">
          <section className="home-plan-cta" aria-labelledby="home-plan-heading"><div><p className="eyebrow">30-SECOND GUIDE</p><h3 id="home-plan-heading">5つの質問で、今日の候補へ</h3><p>時間・予算・誰と歩くか・気分・安心情報を選ぶと、理由つきでコースを提案します。</p></div><Link className="button button-accent" href="/plan/">30秒診断を始める <span aria-hidden="true">→</span></Link></section>
          <nav className="quick-choice-panel" aria-label="条件別のおさんぽ近道"><p className="eyebrow">QUICK CHOICES</p><h3>今の気分から近道</h3><div className="quick-choice-grid">{quickChoices.map((choice) => <Link href={choice.href} key={choice.href}><strong>{choice.label}</strong><span>{choice.note}</span></Link>)}</div></nav>
        </div>
        <section className="home-condition-panel" aria-labelledby="home-condition-heading"><div><p className="eyebrow">SEARCH & FILTER</p><h3 id="home-condition-heading">条件から探す</h3><p>キーワードとエリアから始め、一覧ページで時間・予算・気分・同行者まで絞り込めます。</p></div><HeroSearch /><Link className="home-condition-detail" href="/courses/">すべての条件を見る <span aria-hidden="true">→</span></Link></section>
      </div></section>

      <section className="summary-strip" aria-label="公開中の情報数"><div className="container summary-grid">
        <div><strong>{courses.length}</strong><span>公開中コース</span></div><div><strong>{spots.length}</strong><span>公開中スポット</span></div><div><strong>{currentEvents.length}</strong><span>予定・開催中イベント</span></div><div><strong>{areas.length}</strong><span>公開エリア</span></div>
      </div></section>

      <section className="section home-content"><div className="container home-two-column">
        <div className="home-main">
          <div className="section-heading"><div><p className="eyebrow">COURSES</p><h2>今歩けるコースを選ぶ</h2><p>公開情報と確認日を掲載した3つのモデルコースです。</p></div><Link href="/courses/">すべて見る →</Link></div>
          <CourseCardCollection items={courses} placement="home-recommended-courses" />
          <div className="section-heading spaced-heading"><div><p className="eyebrow">AREAS</p><h2>エリアから探す</h2></div><Link href="/areas/">エリア一覧 →</Link></div>
          <p className="availability-note">現在は<strong>{areas.length}エリア公開中</strong>です。東京40エリアのうち、残り{40 - areas.length}エリアは公開情報を確認でき次第、順次追加します。</p>
          <div className="card-grid">{areas.map((area) => <AreaCard area={area} key={area.id} />)}</div>
          <MonetizationSlot placement="home-after-courses" contentId="home" />
          <div className="section-heading spaced-heading"><div><p className="eyebrow">BY INTEREST</p><h2>テーマから探す</h2><p>公開中コースの登録テーマから選べます。</p></div></div>
          <nav className="theme-link-grid" aria-label="テーマ別コース">{themes.map((theme) => <Link href={conditionLandingByTheme[theme.key] ?? `/courses/?mood=${theme.key}`} key={theme.key}><span className="eyebrow">{theme.count} COURSE</span><strong>{theme.label}</strong><span>{theme.description}</span></Link>)}</nav>
          <section className="home-map-feature"><div className="section-heading"><div><p className="eyebrow">MAP</p><h2>地図から探す</h2><p>高円寺・吉祥寺・浅草の位置を見ながら、歩きたい街を選べます。</p></div><Link href="/map/">地図ページへ →</Link></div><MapEmbed query={areas.map((area) => area.mapQuery).join(" ")} title="高円寺・吉祥寺・浅草の地図" contentId="tokyo-areas" placement="home-main-map" /><div className="map-area-links" aria-label="エリア別の地図">{areas.map((area) => <Link href={`/areas/${area.id}/`} key={area.id}>{area.name}</Link>)}</div></section>
          <div className="section-heading spaced-heading"><div><p className="eyebrow">EVENTS</p><h2>現在・今後のイベント</h2></div><Link href="/events/">イベント一覧 →</Link></div>
          {currentEvents.length ? <ul className="home-event-list">{currentEvents.map((event) => <li key={event.id}><Link href={`/events/${event.id}/`}><strong>{event.title}</strong><span>{event.venue}</span></Link></li>)}</ul> : <p className="empty-inline-note">現在、確認済みの開催予定イベントはありません。過去の掲載情報はイベント一覧で確認できます。</p>}
          <div className="section-heading spaced-heading"><div><p className="eyebrow">STORIES</p><h2>街の読み物</h2></div><Link href="/stories/">すべて見る →</Link></div>
          <div className="card-grid">{stories.map((story) => <StoryCard story={story} key={story.id} />)}</div>
          <div className="section-heading spaced-heading"><div><p className="eyebrow">SPOTS</p><h2>注目スポット</h2></div><Link href="/spots/">スポット一覧 →</Link></div>
          <div className="card-grid">{spots.slice(0, 3).map((spot) => <SpotCard spot={spot} key={spot.id} />)}</div>
        </div>
        <aside className="home-sidebar">
          <section className="sidebar-panel"><p className="eyebrow">UPDATES</p><h2>新着・更新情報</h2><ul className="compact-list">{updates.map(([key, verification]) => <li key={key}><span>{dateLabel(verification.lastUpdatedAt)}</span><Link href={verification.internalPath}>{contentNames.get(key) ?? "掲載情報"}</Link></li>)}</ul></section>
          <section className="sidebar-panel"><p className="eyebrow">ABOUT</p><h2>このサイトについて</h2><p>公開情報をもとに整理し、現地取材は行っていません。AI画像には「イメージ」と表示しています。</p><Link href="/editorial-policy/">編集方針を読む →</Link></section>
          <section className="sidebar-panel partner-panel business-panel"><p className="eyebrow">FOR BUSINESSES</p><h2>地域のお店・事業者の方へ</h2><p>地図とWebで、お店の魅力を伝えるサービスです。</p><Link href="/business/" data-analytics-event="business_cta_click" data-page-type="home" data-content-id="business-home" data-placement="home-sidebar-business">サービスを見る →</Link><Link className="external-text-link" href="/business/contact/">Googleフォームで相談できます</Link></section>
        </aside>
      </div></section>
    </main>
  );
}
