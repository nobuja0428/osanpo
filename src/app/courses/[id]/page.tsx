import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { FavoriteButton } from "@/components/FavoriteButton";
import { PageHero } from "@/components/PageHero";
import { TrustPanel } from "@/components/TrustPanel";
import { MonetizationSlot } from "@/components/MonetizationSlot";
import { areaById, courseById, courses, foodBreaks, imagePath, officialSourcesFor, toilets, transitAccess } from "@/lib/content";
import { absoluteUrl, assetUrl } from "@/lib/site";
import { verificationFor } from "@/lib/verification";
import { ContentViewTracker } from "@/components/ContentViewTracker";
import { MapEmbed } from "@/components/MapEmbed";
import { mapDirectionsUrl, mapExternalUrl } from "@/lib/maps";

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
  const routeQueries = course.routeStops.map((stop) => stop.query);
  const wholeRouteUrl = mapDirectionsUrl(routeQueries);

  return (
    <main id="main">
      <ContentViewTracker type="course" id={course.id} areaId={course.areaId} />
      <PageHero eyebrow={`${area.name}・モデルコース`} title={course.title} lead={course.summary} crumbs={[{ href: "/courses/", label: "コース" }, { label: course.title }]} />
      <section className="section">
        <div className="container detail-grid">
          <article>
            <div className="detail-cover">
              <Image src={assetUrl(imagePath(course.image))} alt={course.imageAlt} width={800} height={600} sizes="(max-width: 900px) calc(100vw - 40px), 740px" />
              <span className="image-label">イメージ</span>
            </div>
            <FavoriteButton type="course" id={course.id} />
            <nav className="page-section-nav" aria-label="コース内ナビ"><a href="#course-overview">コース概要</a><a href="#course-map">地図</a><a href="#course-route">徒歩ルート</a><a href="#course-stops">立ち寄り地点</a><a href="#course-access">アクセス</a><a href="#course-info">情報確認</a></nav>
            <dl className="facts" id="course-overview">
              <div><dt>所要時間</dt><dd>{course.duration}</dd></div>
              <div><dt>距離</dt><dd>{course.distance}</dd></div>
              <div><dt>予算</dt><dd>{course.budget}</dd></div>
              <div><dt>向いている人</dt><dd>{course.audience}</dd></div>
              <div><dt>スタート</dt><dd>{course.routeStops[0]?.name}</dd></div>
              <div><dt>ゴール</dt><dd>{course.routeStops.at(-1)?.name}</dd></div>
            </dl>

            <section className="course-map-section" id="course-map"><div className="section-title-row"><div><p className="eyebrow">COURSE MAP</p><h2>コースの地図</h2></div></div><MapEmbed query={routeQueries.join(" ")} title={`${course.title}の地図`} contentId={course.id} areaId={course.areaId} placement="course-map" /><div className="route-actions"><a className="button button-primary" href={mapExternalUrl(routeQueries.join(" "))} target="_blank" rel="noopener noreferrer" data-analytics-event="google_map_click" data-page-type="course" data-content-id={course.id} data-area-id={course.areaId} data-placement="course-map">Googleマップで大きく開く <span aria-hidden="true">↗</span></a><a className="button button-secondary" href={wholeRouteUrl} target="_blank" rel="noopener noreferrer" data-analytics-event="walking_route_click" data-page-type="course" data-content-id={course.id} data-area-id={course.areaId} data-route-segment="whole" data-placement="course-map">コース全体の徒歩ルートを開く <span aria-hidden="true">↗</span></a></div></section>

            <h2 id="course-route">STARTからGOALまでの徒歩ルート</h2>
            <ol className="route-list">
              {course.routeStops.map((stop, index) => {
                const stage = index === 0 ? "START" : index === course.routeStops.length - 1 ? "GOAL" : `STOP ${stop.order}`;
                const stageClass = index === 0 ? "is-start" : index === course.routeStops.length - 1 ? "is-goal" : "is-stop";
                return <li className={`route-stop ${stageClass}`} key={stop.order}>
                  <span className="route-stage">{stage}</span><strong>{stop.name}</strong><br />
                  <a href={mapExternalUrl(stop.query)} target="_blank" rel="noopener noreferrer" data-analytics-event="map_spot_click" data-page-type="course" data-content-id={course.id} data-area-id={course.areaId} data-placement="course-stops">各地点をGoogleマップで見る <span aria-hidden="true">↗</span></a>
                </li>
              })}
            </ol>
            <div className="route-actions">{course.routeSegments.map((segment) => {
              const origin = course.routeStops.find((stop) => stop.order === segment.originStopOrder);
              const destination = course.routeStops.find((stop) => stop.order === segment.destinationStopOrder);
              const waypoints = segment.waypointStopOrders.map((order) => course.routeStops.find((stop) => stop.order === order)?.query).filter((query): query is string => Boolean(query));
              if (!origin || !destination) return null;
              return <a className="button button-secondary" key={segment.id} href={mapDirectionsUrl([origin.query, ...waypoints, destination.query])} target="_blank" rel="noopener noreferrer" data-analytics-event="walking_route_click" data-page-type="course" data-content-id={course.id} data-area-id={course.areaId} data-route-segment={segment.id} data-placement="course-route">{segment.label}を徒歩ルートで見る <span aria-hidden="true">↗</span></a>;
            })}</div>
            <p>{course.routeNotice}</p>
            <MonetizationSlot page="course" placement="near-map-action" />

            <h2 id="course-access">1. 電車・駅情報</h2>
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
            <TrustPanel verification={verification} />
          </article>
          <aside className="sidebar-panel" id="course-info">
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
