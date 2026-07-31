import { describe, expect, it } from "vitest";
import { verifyContentRecord } from "@/lib/quality";
import type { ContentVerification } from "@/lib/verification";

const verification: ContentVerification = {
  informationCheckedAt: "2026-07-30", lastUpdatedAt: "2026-07-30", expiresAt: "2026-10-31", confidence: "high", fieldResearch: false, aiAssisted: true, estimated: false,
  officialSources: [{ label: "公式", url: "https://example.jp/", sourceType: "official" }], internalPath: "/areas/koenji/",
};
const record = { key: "area:koenji", title: "高円寺", description: "公開情報を整理した紹介です。", image: "areaKoenji", canonical: "https://nobuja0428.github.io/osanpo/areas/koenji/", verification };

describe("content quality gate", () => {
  it("accepts a complete record", () => expect(verifyContentRecord(record)).toEqual([]));
  it("rejects missing information checked date", () => expect(verifyContentRecord({ ...record, verification: { ...verification, informationCheckedAt: "" } }).some((issue) => issue.code === "checked-at")).toBe(true));
  it("rejects missing official sources", () => expect(verifyContentRecord({ ...record, verification: { ...verification, officialSources: [] } }).some((issue) => issue.code === "official-sources")).toBe(true));
  it("rejects unsafe source URLs and reversed event dates", () => expect(verifyContentRecord({ ...record, eventDates: { start: "2026-07-31T10:00:00+09:00", end: "2026-07-30T10:00:00+09:00" }, verification: { ...verification, officialSources: [{ ...verification.officialSources[0], url: "http://example.jp/" }] } }).map((issue) => issue.code)).toEqual(expect.arrayContaining(["source", "event-date-order"])));
  it("rejects unsupported experience claims", () => expect(verifyContentRecord({ ...record, description: "実際に歩いて確認しました。" }).some((issue) => issue.code === "experience-claim")).toBe(true));
  it("warns for expired verification", () => expect(verifyContentRecord({ ...record, verification: { ...verification, expiresAt: "2020-01-01" } }).some((issue) => issue.level === "warning" && issue.code === "expired")).toBe(true));
});
