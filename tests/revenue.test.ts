import { describe, expect, it } from "vitest";
import { contentTemplates, sharedContentTemplateFields } from "@/content/templates";
import { courseLandings, coursesForLanding } from "@/lib/course-landings";
import { courses } from "@/lib/content";
import { monetizationConfig, resolveMonetization, validateMonetizationConfig, type MonetizationConfig, type SponsorAd } from "@/content/monetization";

describe("revenue growth quality", () => {
  it("publishes only condition landings backed by at least two real courses", () => {
    expect(courseLandings.length).toBe(2);
    for (const landing of courseLandings) expect(coursesForLanding(landing, courses).length).toBeGreaterThanOrEqual(2);
    expect(new Set(courseLandings.map((landing) => landing.title)).size).toBe(courseLandings.length);
    expect(new Set(courseLandings.map((landing) => landing.description)).size).toBe(courseLandings.length);
    expect(new Set(courseLandings.map((landing) => coursesForLanding(landing, courses).map((course) => course.id).sort().join(","))).size).toBe(courseLandings.length);
  });

  it("keeps reusable templates for every managed content type", () => {
    expect(Object.keys(contentTemplates)).toEqual(["area", "course", "spot", "story", "event"]);
    expect(sharedContentTemplateFields).toEqual(expect.arrayContaining(["id", "title", "summary", "area", "officialSource", "informationCheckedAt", "lastUpdatedAt", "expiresAt", "mapQuery", "aiAssisted", "fieldResearch", "estimated", "image", "imageAlt"]));
  });

  it("detects sponsor expiry and one-per-scope limit", () => {
    const sponsor = (id: string): SponsorAd => ({ id, name: id, headline: "確認済み広告", href: "https://example.com/", placements: ["course-detail-after-info"], areaId: "koenji", scopeType: "area", startAt: "2026-01-01", endAt: "2026-01-31", active: true });
    const config: MonetizationConfig = { ...monetizationConfig, sponsorEnabled: true, sponsors: [sponsor("one"), sponsor("two")] };
    const issues = validateMonetizationConfig(config, new Date("2026-08-14T00:00:00+09:00"));
    expect(issues.some((issue) => issue.code === "sponsor-count-limit" && issue.level === "error")).toBe(true);
    expect(issues.filter((issue) => issue.code === "sponsor-expired")).toHaveLength(2);
  });

  it("limits a course sponsor to its configured content ID", () => {
    const item: SponsorAd = { id: "course-only", name: "確認済み広告", headline: "対象コース限定", href: "https://example.com/", placements: ["course-detail-after-info"], areaId: "koenji", contentId: "koenji-first", scopeType: "course", active: true };
    const config: MonetizationConfig = { ...monetizationConfig, sponsorEnabled: true, sponsors: [item] };
    expect(resolveMonetization("course-detail-after-info", { areaId: "koenji", contentId: "koenji-first" }, config)?.type).toBe("sponsor");
    expect(resolveMonetization("course-detail-after-info", { areaId: "koenji", contentId: "other-course" }, config)?.type).toBe("house");
  });

  it("rejects incomplete or incompatible active sponsor scopes", () => {
    const invalid: SponsorAd = { id: "bad-scope", name: "確認済み広告", headline: "不正設定", href: "http://example.com/", placements: ["story-end"], scopeType: "course", active: true };
    const config: MonetizationConfig = { ...monetizationConfig, sponsorEnabled: true, sponsors: [invalid] };
    const codes = validateMonetizationConfig(config).map((issue) => issue.code);
    expect(codes).toEqual(expect.arrayContaining(["sponsor-scope", "sponsor-scope-placement", "sponsor-url"]));
  });
});
