import { siteData } from "@/content/site-data";

export type Area = (typeof siteData.areas)[number];
export type Course = (typeof siteData.courses)[number];
export type Spot = (typeof siteData.spots)[number];
export type Story = (typeof siteData.stories)[number];
export type EventItem = (typeof siteData.events)[number];

export const areas = siteData.areas;
export const courses = siteData.courses;
export const spots = siteData.spots;
export const stories = siteData.stories;
export const events = siteData.events;
export const transitAccess = siteData.transitAccess;
export const toilets = siteData.toilets;
export const foodBreaks = siteData.foodBreaks;

export type ContentRecord = Area | Course | Spot | Story | EventItem;

export function areaById(id: string) {
  return areas.find((area) => area.id === id);
}

export function courseById(id: string) {
  return courses.find((course) => course.id === id);
}

export function spotById(id: string) {
  return spots.find((spot) => spot.id === id);
}

export function storyById(id: string) {
  return stories.find((story) => story.id === id);
}

export function eventById(id: string) {
  return events.find((event) => event.id === id);
}

export function imagePath(key: string) {
  return siteData.images[key as keyof typeof siteData.images];
}

export function officialSourcesFor(areaId: string) {
  return areaById(areaId)?.officialSources ?? [];
}
