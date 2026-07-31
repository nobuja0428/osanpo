import type { EventItem } from "@/lib/content";
import { isExpired, verificationFor } from "@/lib/verification";

export type EventState = "scheduled" | "ongoing" | "ended" | "cancelled" | "postponed" | "needs-update";

type EventLike = Pick<EventItem, "id" | "start" | "end" | "status"> & { informationCheckedAt?: string };

function explicitState(status: unknown): EventState | undefined {
  if (status === "中止" || status === "cancelled") return "cancelled";
  if (status === "延期" || status === "postponed") return "postponed";
  if (status === "終了" || status === "ended") return "ended";
  if (status === "更新待ち" || status === "needs-update") return "needs-update";
  return undefined;
}

export function eventState(event: EventLike, now = new Date()): EventState {
  const forced = explicitState(event.status);
  if (forced) return forced;
  const verification = verificationFor("event", event.id);
  const start = new Date(event.start).getTime();
  const end = new Date(event.end).getTime();
  if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) return "needs-update";

  const nowTime = now.getTime();
  if (nowTime > end) return "ended";
  if (!event.informationCheckedAt || !verification || isExpired(verification, now)) return "needs-update";
  if (nowTime < start) return "scheduled";
  if (nowTime <= end) return "ongoing";
  return "ended";
}

export const eventStateLabels: Record<EventState, string> = {
  scheduled: "予定",
  ongoing: "開催中",
  ended: "終了",
  cancelled: "中止",
  postponed: "延期",
  "needs-update": "更新待ち",
};

export function isRecommendedEvent(event: EventItem, now = new Date()) {
  const state = eventState(event, now);
  return state === "scheduled" || state === "ongoing";
}
