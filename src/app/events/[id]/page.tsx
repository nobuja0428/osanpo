import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ContentViewTracker } from "@/components/ContentViewTracker";
import { MonetizationSlot } from "@/components/MonetizationSlot";
import { PageHero } from "@/components/PageHero";
import { TrustPanel } from "@/components/TrustPanel";
import { eventById, events, imagePath } from "@/lib/content";
import { absoluteUrl, assetUrl } from "@/lib/site";
import { dateLabel, verificationFor } from "@/lib/verification";

export function generateStaticParams() {
  return events.map((event) => ({ id: event.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const event = eventById(id);
  if (!event) return {};
  return { title: event.title, description: `${event.area}・${event.venue}のイベント情報`, alternates: { canonical: absoluteUrl(`events/${event.id}/`) }, openGraph: { images: [{ url: absoluteUrl(imagePath(event.image)), width: 1200, height: 900, alt: event.imageAlt }] } };
}

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = eventById(id);
  if (!event) notFound();
  const verification = verificationFor("event", event.id);
  if (!verification) notFound();
  const start = new Date(event.start).toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });
  const end = new Date(event.end).toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });
  return <main id="main">
    <ContentViewTracker type="event" id={event.id} />
    <PageHero eyebrow="EVENTS" title={event.title} lead={`${event.area}・${event.venue}`} crumbs={[{ href: "/events/", label: "イベント" }, { label: event.title }]} />
    <section className="section"><div className="container detail-grid"><article>
      <div className="detail-cover"><Image src={assetUrl(imagePath(event.image))} alt={event.imageAlt} width={800} height={600} sizes="(max-width: 900px) calc(100vw - 40px), 740px" /><span className="image-label">イメージ</span></div>
      <TrustPanel verification={verification} />
      <dl className="facts"><div><dt>開始</dt><dd>{start}</dd></div><div><dt>終了</dt><dd>{end}</dd></div><div><dt>会場</dt><dd>{event.venue}</dd></div><div><dt>料金</dt><dd>{event.price}</dd></div><div><dt>最終更新日</dt><dd>{dateLabel(event.lastUpdated)}</dd></div><div><dt>確認状態</dt><dd>再確認中</dd></div></dl>
      <p className="trust-warning">開催済みまたは確認期限を過ぎたイベントです。参加・訪問前に、必ず公式情報をご確認ください。</p>
      <div className="route-actions"><a className="button button-primary" href={event.officialUrl} target="_blank" rel="noopener noreferrer" data-analytics-event="external_link_click" data-content-id={event.id}>公式情報を確認</a><a className="button button-secondary" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.mapQuery)}`} target="_blank" rel="noopener noreferrer" data-analytics-event="google_map_click" data-content-id={event.id}>会場を地図で見る</a></div>
      <MonetizationSlot page="event" placement="article-end" />
    </article><aside className="sidebar-panel"><p className="eyebrow">EVENT NOTICE</p><h2>掲載について</h2><p>公式公開情報をもとに整理しています。日時・会場・入場条件は変更される場合があります。</p></aside></div></section>
  </main>;
}
