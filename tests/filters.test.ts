import { describe, expect, it } from "vitest";
import { courses } from "@/lib/content";
import { filterCourses } from "@/lib/filters";

describe("filterCourses", () => {
  it("returns every course without filters", () => {
    expect(filterCourses(courses, {})).toHaveLength(3);
  });

  it("filters by duration and budget", () => {
    expect(filterCourses(courses, { duration: "120", budget: "3000" }).map((course) => course.id))
      .toEqual(["koenji-first"]);
  });

  it("filters by audience and mood", () => {
    expect(filterCourses(courses, { audience: "date", mood: "nature" }).map((course) => course.id))
      .toEqual(["kichijoji-park"]);
  });

  it("returns an empty result for incompatible filters", () => {
    expect(filterCourses(courses, { area: "asakusa", audience: "date" })).toHaveLength(0);
  });

  it("searches course copy by keyword", () => {
    expect(filterCourses(courses, { keyword: "門前町" }).map((course) => course.id))
      .toEqual(["asakusa-history"]);
  });
});
