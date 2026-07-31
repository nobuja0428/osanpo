import Link from "next/link";
import Image from "next/image";
import type { Area, Course, Spot, Story } from "@/lib/content";
import { areaById, imagePath } from "@/lib/content";
import { assetUrl } from "@/lib/site";
import { isExpired, verificationFor, type ContentType } from "@/lib/verification";

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
      <CardImage imageKey={area.image} alt={area.imageAlt} />
      <div className="card-body">
        <p className="eyebrow">{area.ward}</p>
        <RecheckBadge type="area" id={area.id} />
        <h3><Link href={`/areas/${area.id}/`}>{area.name}</Link></h3>
        <p>{area.lead}</p>
        <div className="pills">{area.tags.map((tag) => <span className="pill" key={tag}>{tag}</span>)}</div>
      </div>
    </article>
  );
}

export function CourseCard({ course }: { course: Course }) {
  const area = areaById(course.areaId);
  return (
    <article className="card">
      <CardImage imageKey={course.image} alt={course.imageAlt} />
      <div className="card-body">
        <p className="eyebrow">{area?.name}・モデルコース</p>
        <RecheckBadge type="course" id={course.id} />
        <h3><Link href={`/courses/${course.id}/`}>{course.title}</Link></h3>
        <p>{course.summary}</p>
        <div className="pills">
          <span className="pill">{course.duration}</span>
          <span className="pill">{course.budget}</span>
          <span className="pill">{course.audience}</span>
        </div>
      </div>
    </article>
  );
}

export function SpotCard({ spot }: { spot: Spot }) {
  const area = areaById(spot.areaId);
  return (
    <article className="card">
      <CardImage imageKey={spot.image} alt={spot.imageAlt} />
      <div className="card-body">
        <p className="eyebrow">{area?.name}・{spot.category}</p>
        <RecheckBadge type="spot" id={spot.id} />
        <h3><Link href={`/spots/${spot.id}/`}>{spot.name}</Link></h3>
        <p>{spot.excerpt}</p>
      </div>
    </article>
  );
}

export function StoryCard({ story }: { story: Story }) {
  const area = areaById(story.areaId);
  return (
    <article className="card">
      <CardImage imageKey={story.image} alt={story.imageAlt} />
      <div className="card-body">
        <p className="eyebrow">{area?.name}・{story.category}</p>
        <RecheckBadge type="story" id={story.id} />
        <h3><Link href={`/stories/${story.id}/`}>{story.title}</Link></h3>
        <p>{story.excerpt}</p>
      </div>
    </article>
  );
}
