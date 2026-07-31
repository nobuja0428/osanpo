import Link from "next/link";
import Image from "next/image";
import { AreaCard, CourseCard, SpotCard, StoryCard } from "@/components/Cards";
import { areas, courses, spots, stories } from "@/lib/content";
import { assetUrl } from "@/lib/site";

export default function HomePage() {
  return (
    <main id="main">
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">TOKYO SANPO CLUB</p>
            <h1>きょうの東京を、<br />歩いて見つけよう。</h1>
            <p className="hero-lead">時間、予算、一緒に歩く人。いまの気分に合う散歩コースを、3つの街から探せます。</p>
            <div className="hero-actions">
              <Link className="button button-primary" href="/courses/">条件から探す</Link>
              <Link className="button button-secondary" href="/areas/">街から探す</Link>
            </div>
          </div>
          <div className="hero-media">
            <Image src={assetUrl("assets/images/hero/hero-tokyo-walk.webp")} width={1600} height={900} alt="東京の街歩きを表現したイメージ" priority />
            <span className="image-label">イメージ</span>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-heading">
            <div><p className="eyebrow">FIND YOUR WALK</p><h2>条件から散歩を探す</h2></div>
            <Link href="/courses/">すべての条件を見る →</Link>
          </div>
          <div className="quick-links">
            <Link href="/courses/?duration=120"><strong>2時間以内</strong><span>短時間で楽しむ</span></Link>
            <Link href="/courses/?budget=3000"><strong>3,000円以内</strong><span>予算を決めて歩く</span></Link>
            <Link href="/courses/?audience=solo"><strong>一人で</strong><span>自分のペースで歩く</span></Link>
            <Link href="/courses/?audience=date"><strong>デートで</strong><span>会話を楽しみながら</span></Link>
          </div>
        </div>
      </section>

      <section className="section section-tint">
        <div className="container">
          <div className="section-heading"><div><p className="eyebrow">COURSES</p><h2>まず歩きたい3コース</h2></div></div>
          <div className="card-grid">{courses.map((course) => <CourseCard course={course} key={course.id} />)}</div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-heading"><div><p className="eyebrow">AREAS</p><h2>注目エリア</h2></div><Link href="/areas/">エリア一覧 →</Link></div>
          <div className="card-grid">{areas.map((area) => <AreaCard area={area} key={area.id} />)}</div>
        </div>
      </section>

      <section className="section section-tint">
        <div className="container">
          <div className="section-heading"><div><p className="eyebrow">STOPS & STORIES</p><h2>立ち寄り先と街の読み物</h2></div></div>
          <div className="card-grid">{spots.slice(0, 3).map((spot) => <SpotCard spot={spot} key={spot.id} />)}</div>
          <div className="card-grid card-grid-spaced">{stories.map((story) => <StoryCard story={story} key={story.id} />)}</div>
        </div>
      </section>

      <section className="section">
        <div className="container policy-callout">
          <div>
            <p className="eyebrow">EDITORIAL POLICY</p>
            <h2>公開情報をもとに編集しています</h2>
            <p>掲載内容は自治体・施設などの公式情報を参考に整理しています。画像にはAI生成のイメージ素材を含み、原則として現地取材は行っていません。</p>
          </div>
          <Link className="button button-secondary" href="/editorial-policy/">編集方針を読む</Link>
        </div>
      </section>
    </main>
  );
}
