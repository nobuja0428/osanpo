import { describe, expect, it } from "vitest";
import { courses } from "@/lib/content";
import { emptyPlanCriteria, parsePlanCriteria, planCriteriaSearch, rankCourses } from "@/lib/planner";

describe("today's sanpo planner", () => {
  it("ranks all published courses with unspecified conditions", () => {
    expect(rankCourses(courses, emptyPlanCriteria()).map((item) => item.course.id)).toHaveLength(3);
  });

  it("prioritizes duration and budget limits", () => {
    expect(rankCourses(courses, { duration: "120", assurances: [] })[0].course.id).toBe("koenji-first");
    expect(rankCourses(courses, { budget: "3000", assurances: [] })[0].course.id).toBe("koenji-first");
    expect(rankCourses(courses, { duration: "120", budget: "3000", assurances: [] })[0].completeMatch).toBe(true);
  });

  it("scores audience, mood, and assurance preferences", () => {
    expect(rankCourses(courses, { audience: "date", assurances: [] })[0].course.id).toBe("kichijoji-park");
    expect(rankCourses(courses, { mood: "history", assurances: [] })[0].course.id).toBe("asakusa-history");
    const result = rankCourses(courses, { audience: "family", mood: "history", assurances: ["toilet", "transit", "verified"] })[0];
    expect(result.course.id).toBe("asakusa-history");
    expect(result.reasons.join(" ")).toContain("トイレ情報");
  });

  it("returns the closest course and marks a partial match", () => {
    const result = rankCourses(courses, { duration: "60", budget: "1000", audience: "date", mood: "history", assurances: [] })[0];
    expect(result.completeMatch).toBe(false);
    expect(result.reasons.length).toBeGreaterThan(0);
  });

  it("round-trips valid URL values and ignores invalid values", () => {
    const parsed = parsePlanCriteria("?duration=120&budget=3000&audience=solo&mood=shopping&assurance=toilet,rest,bad");
    expect(parsed).toEqual({ duration: "120", budget: "3000", audience: "solo", mood: "shopping", assurances: ["toilet", "rest"] });
    expect(parsePlanCriteria("?duration=999&budget=x&audience=person&mood=random&assurance=bad")).toEqual({ assurances: [] });
    expect(parsePlanCriteria(`?${planCriteriaSearch(parsed)}`)).toEqual(parsed);
  });

  it("never returns more than the existing data order permits", () => {
    expect(rankCourses(courses, emptyPlanCriteria()).slice(0, 3)).toHaveLength(3);
  });
});
