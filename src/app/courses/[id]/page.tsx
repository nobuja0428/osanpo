import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { FavoriteButton } from "@/components/FavoriteButton";
import { PageHero } from "@/components/PageHero";
import { TrustPanel } from "@/components/TrustPanel";
import { areaById, courseById, courses, foodBreaks, imagePath, officialSourcesFor, toilets, transitAccess } from "@/lib/content";
import { absoluteUrl, assetUrl } from "@/lib/site";
import { verificationFor } from "@/lib/verification";

export function generateStaticParams() {
  return courses.map((course) => ({ id: course.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const course = courseById(id);
  if (!course) return {};
  return {
    title: course.title,
    description: course.summary,
    alternates: { canonical: absoluteUrl(`courses/${course.id}/`) },
    openGraph: { images: [{ url: absoluteUrl(imagePath(course.image)), width: 1200, height: 900, alt: course.imageAlt }] },
  };
}

export default async function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const course = courseById(id);
  if (!course) notFound();
  const area = areaById(course.areaId);
  if (!area) notFound();
  const verification = verificationFor("course", course.id);
  if (!verification) notFound();

  const courseTransit = transitAccess.filter((item) => item.courseId === course.id);
  const courseFood = foodBreaks.filter((item) => item.courseId === course.id);
  const courseToilets = toilets.filter((item) => item.courseId === course.id);
  const sources = officialSourcesFor(course.areaId);

  return (
    <main id="main">
      <PageHero eyebrow={`${area.name}・モデルコース`} title={course.title} lead={course.summary} crumbs={[{ href: "/courses/", label: "コース" }, { label: course.title }]} />
      <section className="section">
        <div className="container detail-grid">
          <article>
            <div className="detail-cover">
              <Image src={assetUrl(imagePath(course.image))} alt={course.imageAlt} width={1200} height={900} priority />
              <span className="image-label">イメージ</span>
            </div>
            <FavoriteButton type="course" id={course.id} />
            <TrustPanel verification={verification} />
            <dl className="facts">
              <div><dt>所要時間</dt><dd>{course.duration}</dd></div>
              <div><dt>距離</dt><dd>{course.distance}</dd></div>
              <div><dt>予算</dt><dd>{course.budget}</dd></div>
              <div><dt>向いている人</dt><dd>{course.audience}</dd></div>
            </dl>

            <h2>歩く順番</h2>
            <ol className="route-list">
              {course.routeStops.map((stop) => (
                <li key={stop.order}>
                  <strong>{stop.name}</strong><br />
                  <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(stop.query)}`} target="_blank" rel="noreferrer">地図を開く</a>
                </li>
              ))}
            </ol>
            <p>{course.routeNotice}</p>

            <h2>1. 電車・駅情報</h2>
            {courseTransit.map((item) => (
              <section key={item.id} className="sidebar-panel">
                <h3>{item.roleLabel}：{item.stationName} {item.stationCode}</h3>
                <p>{item.routeConnection}</p>
                <p>情報確認日：{item.informationCheckedAt || "未記録"}／現地確認：{item.fieldResearch ? "あり" : "なし"}</p>
              </section>
            ))}

            <h2>2. 食事・カフェ・休憩情報</h2>
            {courseFood.map((item) => (
              <section key={item.id} className="sidebar-panel">
                <h3>{item.roleLabel}：{item.name}</h3>
                <p>{item.editorialNote}</p>
                <p>{item.locationNote}／{item.priceLabel}</p>
                <p>情報確認日：{item.informationCheckedAt || "未記録"}／現地取材・実食：{item.fieldResearch ? "あり" : "なし"}</p>
                <a href={item.officialUrl || item.sourceUrl} target="_blank" rel="noreferrer">公式情報・出典</a>
              </section>
            ))}

            <h2>3. トイレ情報</h2>
            {courseToilets.map((item) => (
              <section key={item.id} className="sidebar-panel">
                <h3>{item.name}</h3>
                <p>{item.nearStopName}付近／{item.locationNote}</p>
                <p>車いす対応：{item.wheelchair === true ? "あり" : item.wheelchair === false ? "なし" : "情報なし"}／乳幼児設備：{item.infantFacilities === true ? "あり" : item.infantFacilities === false ? "なし" : "情報なし"}</p>
                <p>情報確認日：{item.informationCheckedAt || "未記録"}</p>
                <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.mapQuery)}`} target="_blank" rel="noreferrer">地図を開く</a>
              </section>
            ))}
          </article>
          <aside className="sidebar-panel">
            <h2>掲載情報について</h2>
            <p>現地取材・コース実歩行は未実施です。時間、距離、予算には推定値を含みます。</p>
            <p>文章の構成・整理にAIを使用しています。訪問前に公式情報をご確認ください。</p>
            <h3>公式情報源</h3>
            <ul className="source-list">
              {sources.map((source) => <li key={source.url}><a href={source.url} target="_blank" rel="noreferrer">{source.label}</a></li>)}
            </ul>
          </aside>
        </div>
      </section>
    </main>
  );
}
