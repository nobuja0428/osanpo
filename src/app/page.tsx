import Link from "next/link";
import Image from "next/image";
import { AreaCard, CourseCard, SpotCard, StoryCard } from "@/components/Cards";
import { HeroSearch } from "@/components/HeroSearch";
import { areas, courses, events, spots, stories } from "@/lib/content";
import { isRecommendedEvent } from "@/lib/events";
import { assetUrl } from "@/lib/site";
import { dateLabel, verificationCatalog } from "@/lib/verification";
import { MonetizationSlot } from "@/components/MonetizationSlot";
import { MapEmbed } from "@/components/MapEmbed";

const contentNames = new Map<string, string>([
  ...areas.map((item): [string, string] => [`area:${item.id}`, item.name]),
  ...courses.map((item): [string, string] => [`course:${item.id}`, item.title]),
  ...spots.map((item): [string, string] => [`spot:${item.id}`, item.name]),
  ...stories.map((item): [string, string] => [`story:${item.id}`, item.title]),
]);

export default function HomePage() {
  const currentEvents = events.filter((event) => isRecommendedEvent(event)).slice(0, 4);
  const updates = Object.entries(verificationCatalog)
    .filter(([key]) => !key.startsWith("event:"))
    .sort(([, a], [, b]) => b.lastUpdatedAt.localeCompare(a.lastUpdatedAt))
    .slice(0, 5);

  return (
    <main id="main">
      <section className="hero hero-complete">
        <div className="container hero-complete-inner">
          <Image className="hero-background" src={assetUrl("assets/images/hero/hero-tokyo-walk.webp")} width={960} height={540} sizes="100vw" alt="東京の街歩きを表現したイメージ" preload fetchPriority="high" />
          <div className="hero-overlay">
            <p className="eyebrow">TOKYO SANPO CLUB</p>
            <h1>東京を、もっと歩きたくなる。</h1>
            <p className="hero-lead">歴史・文化・自然・グルメを楽しむ、確認情報つきの散歩コースガイドです。</p>
            <HeroSearch />
            <div className="hero-actions"><Link href="/courses/" className="text-link">詳細な条件から探す</Link><Link href="/about/" className="text-link">はじめての方へ</Link></div>
          </div>
          <span className="image-label">イメージ</span>
        </div>
      </section>

      <section className="summary-strip" aria-label="公開中の情報数"><div className="container summary-grid">
        <div><strong>{courses.length}</strong><span>公開中コース</span></div><div><strong>{spots.length}</strong><span>公開中スポット</span></div><div><strong>{currentEvents.length}</strong><span>予定・開催中イベント</span></div><div><strong>{areas.length}</strong><span>公開エリア</span></div>
      </div></section>

      <section className="section home-content"><div className="container home-two-column">
        <div className="home-main">
          <div className="section-heading"><div><p className="eyebrow">COURSES</p><h2>おすすめおさんぽコース</h2></div><Link href="/courses/">すべて見る →</Link></div>
          <div className="card-grid">{courses.map((course) => <CourseCard course={course} key={course.id} />)}</div>
          <div className="section-heading spaced-heading"><div><p className="eyebrow">AREAS</p><h2>エリアから探す</h2></div><Link href="/areas/">エリア一覧 →</Link></div>
          <p className="availability-note">現在は<strong>{areas.length}エリア公開中</strong>です。東京40エリアのうち、残り{40 - areas.length}エリアは公開情報を確認でき次第、順次追加します。</p>
          <div className="card-grid">{areas.map((area) => <AreaCard area={area} key={area.id} />)}</div>
          <div className="section-heading spaced-heading"><div><p className="eyebrow">STORIES</p><h2>街の読み物</h2></div><Link href="/stories/">すべて見る →</Link></div>
          <div className="card-grid">{stories.map((story) => <StoryCard story={story} key={story.id} />)}</div>
          <div className="section-heading spaced-heading"><div><p className="eyebrow">SPOTS</p><h2>注目スポット</h2></div><Link href="/spots/">スポット一覧 →</Link></div>
          <div className="card-grid">{spots.slice(0, 3).map((spot) => <SpotCard spot={spot} key={spot.id} />)}</div>
        </div>
        <aside className="home-sidebar">
          <section className="sidebar-panel map-panel"><p className="eyebrow">MAP</p><h2>おさんぽマップ</h2><MapEmbed query={areas.map((area) => area.mapQuery).join(" ")} title="高円寺・吉祥寺・浅草の地図" contentId="tokyo-areas" placement="home-sidebar" /><div className="map-area-links" aria-label="エリア別の地図"><Link href="/areas/koenji/">高円寺</Link><Link href="/areas/kichijoji/">吉祥寺</Link><Link href="/areas/asakusa/">浅草</Link></div><Link className="button button-primary" href="/map/">地図から探す</Link></section>
          <section className="sidebar-panel"><p className="eyebrow">EVENTS</p><h2>現在・今後のイベント</h2>{currentEvents.length ? <ul className="compact-list">{currentEvents.map((event) => <li key={event.id}><strong>{event.title}</strong><span>{event.venue}</span></li>)}</ul> : <><p>現在、確認済みのイベント情報はありません。</p><Link href="/events/">過去のイベントを見る →</Link></>}</section>
          <section className="sidebar-panel"><p className="eyebrow">UPDATES</p><h2>新着・更新情報</h2><ul className="compact-list">{updates.map(([key, verification]) => <li key={key}><span>{dateLabel(verification.lastUpdatedAt)}</span><Link href={verification.internalPath}>{contentNames.get(key) ?? "掲載情報"}</Link></li>)}</ul></section>
          <section className="sidebar-panel"><p className="eyebrow">ABOUT</p><h2>このサイトについて</h2><p>公開情報をもとに整理し、現地取材は行っていません。AI画像には「イメージ」と表示しています。</p><Link href="/editorial-policy/">編集方針を読む →</Link></section>
          <section className="sidebar-panel partner-panel business-panel"><p className="eyebrow">FOR BUSINESSES</p><h2>地域のお店・事業者の方へ</h2><p>地図とWebで、お店の魅力を伝えるための準備中サービスです。</p><Link href="/business/" data-analytics-event="business_cta_click" data-page-type="home" data-content-id="business-home" data-placement="home-sidebar-business">サービスを見る →</Link><p className="business-contact-pending" role="status">掲載・制作のご相談は受付準備中</p></section>
        </aside>
      </div></section>
      <MonetizationSlot page="home" placement="before-related-content" />
    </main>
  );
}
