import type { Course } from "@/lib/content";

export type CourseFilters = {
  area?: string;
  duration?: string;
  budget?: string;
  audience?: string;
  mood?: string;
  keyword?: string;
};

export function filterCourses(items: readonly Course[], filters: CourseFilters) {
  const keyword = filters.keyword?.trim().toLocaleLowerCase("ja") ?? "";
  return items.filter((course) => (
    (!filters.area || course.areaId === filters.area)
    && (!filters.duration || course.durationMinutes <= Number(filters.duration))
    && (!filters.budget || course.budgetMaxYen <= Number(filters.budget))
    && (!filters.audience || course.audienceKeys.includes(filters.audience))
    && (!filters.mood || course.moodKeys.includes(filters.mood))
    && (!keyword || [
      course.title,
      course.summary,
      course.audience,
      course.areaId,
      ...course.moodKeys,
    ].join(" ").toLocaleLowerCase("ja").includes(keyword))
  ));
}
