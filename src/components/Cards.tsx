import Link from "next/link";
import Image from "next/image";
import type { Area, Course, Spot, Story } from "@/lib/content";
import { areaById, imagePath } from "@/lib/content";
import { assetUrl } from "@/lib/site";
import { courseRouteQueries, mapDirectionsUrl } from "@/lib/maps";
import { isExpired, verificationFor, type ContentType } from "@/lib/verification";
import { CourseSafetySummary } from "@/components/CourseSafetySummary";

function RecheckBadge({ type, id }: { type: ContentType; id: string }) {
  const verification = verificationFor(type, id);
  return verification && isExpired(verification) ? <span className="pill pill-recheck">再確認中</span> : null;
}

function CardImage({ imageKey, alt }: { imageKey: string; alt: string }) {
  return (
    <div className="card-media">
      <Image src={assetUrl(imagePath(imageKey))} alt={alt} width={800} height={600} sizes="(max-width: 600px) calc(100vw - 28px), (max-width: 900px) calc(50vw - 32px), 360px" />
      <span className="image-label">イメージ</span>
    </div>
  );
}

export function AreaCard({ area }: { area: Area }) {
  return (
    <article className="card">
      <Link className="card-media-link" href={`/areas/${area.id}/`}><CardImage imageKey={area.image} alt={area.imageAlt} /></Link>
      <div className="card-body">
        <p className="eyebrow">{area.ward}</p>
        <RecheckBadge type="area" id={area.id} />
        <h3><Link className="card-primary-link" href={`/areas/${area.id}/`}>{area.name}</Link></h3>
        <p>{area.lead}</p>
        <div className="pills">{area.tags.map((tag) => <span className="pill" key={tag}>{tag}</span>)}</div>
      </div>
    </article>
  );
}

export function CourseCard({ course, onMapOpen, selected = false, placement = "course-card", hideImage = false }: { course: Course; onMapOpen?: (courseId: string) => void; selected?: boolean; placement?: string; hideImage?: boolean }) {
  const area = areaById(course.areaId);
  const routeQueries = courseRouteQueries(course.routeStops);
  const start = course.routeStops[0];
  const goal = course.routeStops[course.routeStops.length - 1];
  return (
    <article className={`card course-card${selected ? " is-selected" : ""}`} data-course-id={course.id}>
      {hideImage ? null : <Link className="card-media-link" href={`/courses/${course.id}/`} data-analytics-event="course_card_click" data-page-type="course-list" data-content-id={course.id} data-area-id={course.areaId} data-placement={`${placement}-image`}><CardImage imageKey={course.image} alt={course.imageAlt} /></Link>}
      <div className="card-body">
        <p className="eyebrow">{area?.name}・モデルコース</p>
        <RecheckBadge type="course" id={course.id} />
        <h3><Link className="card-primary-link" href={`/courses/${course.id}/`} data-analytics-event="course_card_click" data-page-type="course-list" data-content-id={course.id} data-area-id={course.areaId} data-placement={placement}>{course.title}</Link></h3>
        <dl className="course-card-facts"><div><dt>所要時間</dt><dd>{course.duration}</dd></div><div><dt>距離</dt><dd>{course.distance}</dd></div><div><dt>予算</dt><dd>{course.budget}</dd></div></dl>
        <p>{course.summary}</p>
        <div className="course-card-route"><p><span className="route-label is-start">START</span><strong>{start?.name}</strong></p><p><span className="route-label is-goal">GOAL</span><strong>{goal?.name}</strong></p></div>
        <CourseSafetySummary course={course} compact />
        <div className="course-card-actions">
          {onMapOpen ? <button className="button button-primary" type="button" aria-label={`${course.title}の地図を見る`} aria-expanded={selected} onClick={() => onMapOpen(course.id)}>地図を見る</button> : null}
          <a className="button button-secondary" href={mapDirectionsUrl(routeQueries)} target="_blank" rel="noopener noreferrer" data-analytics-event="walking_route_click" data-page-type="course-list" data-content-id={course.id} data-area-id={course.areaId} data-route-segment="whole" data-placement={placement}>徒歩ルートを開く <span aria-hidden="true">↗</span></a>
        </div>
      </div>
    </article>
  );
}

export function SpotCard({ spot }: { spot: Spot }) {
  const area = areaById(spot.areaId);
  return (
    <article className="card">
      <Link className="card-media-link" href={`/spots/${spot.id}/`}><CardImage imageKey={spot.image} alt={spot.imageAlt} /></Link>
      <div className="card-body">
        <p className="eyebrow">{area?.name}・{spot.category}</p>
        <RecheckBadge type="spot" id={spot.id} />
        <h3><Link className="card-primary-link" href={`/spots/${spot.id}/`}>{spot.name}</Link></h3>
        <p>{spot.excerpt}</p>
      </div>
    </article>
  );
}

export function StoryCard({ story }: { story: Story }) {
  const area = areaById(story.areaId);
  return (
    <article className="card">
      <Link className="card-media-link" href={`/stories/${story.id}/`}><CardImage imageKey={story.image} alt={story.imageAlt} /></Link>
      <div className="card-body">
        <p className="eyebrow">{area?.name}・{story.category}</p>
        <RecheckBadge type="story" id={story.id} />
        <h3><Link className="card-primary-link" href={`/stories/${story.id}/`}>{story.title}</Link></h3>
        <p>{story.excerpt}</p>
      </div>
    </article>
  );
}
