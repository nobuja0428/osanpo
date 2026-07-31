import { describe, expect, it } from "vitest";
import { events } from "@/lib/content";
import { eventState, isRecommendedEvent } from "@/lib/events";

const baseEvent = {
  ...events[0],
  informationCheckedAt: "2026-07-01",
  status: "",
  start: "2026-07-10T10:00:00+09:00",
  end: "2026-07-12T18:00:00+09:00",
};

describe("eventState in Asia/Tokyo", () => {
  it("marks the day before as scheduled", () => expect(eventState(baseEvent, new Date("2026-07-09T23:59:59+09:00"))).toBe("scheduled"));
  it("marks the start instant and a multi-day period as ongoing", () => {
    expect(eventState(baseEvent, new Date("2026-07-10T10:00:00+09:00"))).toBe("ongoing");
    expect(eventState(baseEvent, new Date("2026-07-11T12:00:00+09:00"))).toBe("ongoing");
  });
  it("keeps an event ongoing through its end instant and ends it immediately afterward", () => {
    expect(eventState(baseEvent, new Date("2026-07-12T18:00:00+09:00"))).toBe("ongoing");
    expect(eventState(baseEvent, new Date("2026-07-12T18:00:01+09:00"))).toBe("ended");
  });
  it("handles an all-day event expressed in Tokyo time", () => {
    const allDay = { ...baseEvent, start: "2026-07-20T00:00:00+09:00", end: "2026-07-20T23:59:59+09:00" };
    expect(eventState(allDay, new Date("2026-07-20T12:00:00+09:00"))).toBe("ongoing");
    expect(eventState(allDay, new Date("2026-07-21T00:00:00+09:00"))).toBe("ended");
  });
  it("honors only explicit cancelled and postponed states", () => {
    expect(eventState({ ...baseEvent, status: "中止" })).toBe("cancelled");
    expect(eventState({ ...baseEvent, status: "延期" })).toBe("postponed");
  });
  it("does not present unchecked or expired future information as current", () => {
    expect(eventState({ ...baseEvent, informationCheckedAt: "" }, new Date("2026-07-09T12:00:00+09:00"))).toBe("needs-update");
    expect(eventState({ ...baseEvent, start: "2026-08-10T10:00:00+09:00", end: "2026-08-10T18:00:00+09:00" }, new Date("2026-08-01T12:00:00+09:00"))).toBe("needs-update");
  });
  it("keeps ended events available but excludes them from recommendations", () => {
    const ended = { ...baseEvent, start: "2026-06-30T10:00:00+09:00", end: "2026-07-01T18:00:00+09:00" };
    expect(eventState(ended, new Date("2026-07-31T12:00:00+09:00"))).toBe("ended");
    expect(isRecommendedEvent(ended, new Date("2026-07-31T12:00:00+09:00"))).toBe(false);
  });
});
