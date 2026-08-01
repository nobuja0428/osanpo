import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { MonetizationSlot } from "@/components/MonetizationSlot";
import { events } from "@/lib/content";
import { eventState, eventStateLabels } from "@/lib/events";
import { absoluteUrl } from "@/lib/site";
import { assetUrl } from "@/lib/site";
import { imagePath } from "@/lib/content";
import { dateLabel, isExpired, verificationFor } from "@/lib/verification";

export const metadata: Metadata = {
  title: "東京の散歩イベント",
  description: "東京の街歩きと組み合わせられるイベント情報を、確認状態とともに掲載します。",
  alternates: { canonical: absoluteUrl("events/") },
};

function EventList({ stateFilter }: { stateFilter: ReturnType<typeof eventState>[] }) {
  const items = events.filter((item) => stateFilter.includes(eventState(item)));
  if (!items.length) return <div className="empty-state"><p>該当するイベントはありません。</p></div>;
  return (
    <div className="card-grid">
      {items.map((item) => {
        const state = eventState(item);
        const verification = verificationFor("event", item.id);
        const expired = verification ? isExpired(verification) : true;
        return (
          <article className="card" key={item.id}>
            <div className="card-media"><Image src={assetUrl(imagePath(item.image))} alt={item.imageAlt} width={800} height={600} sizes="(max-width: 600px) calc(100vw - 28px), (max-width: 900px) calc(50vw - 32px), 360px" /><span className="image-label">イメージ</span></div>
            <div className="card-body">
              <p className="eyebrow">{eventStateLabels[state]}・{item.area}</p>
              <h3><Link href={`/events/${item.id}/`}>{item.title}</Link></h3>
              <p>{new Date(item.start).toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" })}<br />{new Date(item.end).toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" })}</p>
              <p>{item.venue}・{item.price}</p>
              <p>情報確認日：{verification ? dateLabel(verification.informationCheckedAt) : "未記録"}</p>
              {expired ? <p className="event-recheck" role="status">再確認中：公式情報をご確認ください。</p> : null}
              <div className="card-actions"><a href={item.officialUrl} target="_blank" rel="noopener noreferrer" data-analytics-event="external_link_click" data-content-id={item.id}>公式情報</a><a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.mapQuery)}`} target="_blank" rel="noopener noreferrer" data-analytics-event="google_map_click" data-content-id={item.id}>地図を開く</a></div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

export default function EventsPage() {
  return (
    <main id="main">
      <PageHero eyebrow="EVENTS" title="東京の散歩イベント" lead="終了日時による状態判定を行い、未確認情報は開催中として表示しません。" crumbs={[{ label: "イベント" }]} />
      <section className="section">
        <div className="container">
          <h2>予定・開催中</h2>
          <EventList stateFilter={["scheduled", "ongoing"]} />
          <h2>更新待ち</h2>
          <EventList stateFilter={["needs-update"]} />
          <h2>過去のイベント</h2>
          <EventList stateFilter={["ended", "cancelled", "postponed"]} />
          <MonetizationSlot page="event" placement="article-end" />
        </div>
      </section>
    </main>
  );
}
