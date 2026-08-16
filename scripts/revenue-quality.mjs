import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import vm from "node:vm";
import { validateMonetizationInventory } from "../src/lib/monetization-validation.mjs";

const root = process.cwd();
const source = readFileSync(join(root, "src/content/site-data.ts"), "utf8").replace("export const siteData", "globalThis.siteData");
const context = {};
vm.runInNewContext(source, context);
const data = context.siteData;
const errors = [];
const warnings = [];
const issue = (level, message) => (level === "error" ? errors : warnings).push(message);

const descriptions = new Map();
for (const [type, items, titleField, descriptionField] of [
  ["area", data.areas, "name", "description"], ["course", data.courses, "title", "summary"],
  ["spot", data.spots, "name", "excerpt"], ["story", data.stories, "title", "excerpt"], ["event", data.events, "title", "venue"],
]) {
  for (const item of items) {
    if (!String(item.imageAlt || "").trim()) issue("error", `${type}:${item.id}: imageAlt is required`);
    const description = String(item[descriptionField] || "").trim();
    if (descriptions.has(description)) issue("error", `${type}:${item.id}: duplicate description with ${descriptions.get(description)}`);
    else descriptions.set(description, `${type}:${item.id}`);
    if (!String(item[titleField] || "").trim()) issue("error", `${type}:${item.id}: title is required`);
  }
}

const linkCountFor = {
  course: (item) => 1 + data.courses.filter((other) => other.id !== item.id && other.areaId === item.areaId).length + data.spots.filter((spot) => spot.areaId === item.areaId).length + data.stories.filter((story) => story.areaId === item.areaId).length,
  area: (item) => data.courses.filter((course) => course.areaId === item.id).length + data.spots.filter((spot) => spot.areaId === item.id).length + data.stories.filter((story) => story.areaId === item.id).length,
  spot: (item) => 1 + data.courses.filter((course) => course.areaId === item.areaId).length + data.spots.filter((spot) => spot.id !== item.id && spot.areaId === item.areaId).length + data.stories.filter((story) => story.areaId === item.areaId).length,
  story: (item) => 1 + data.courses.filter((course) => course.areaId === item.areaId).length + data.spots.filter((spot) => spot.areaId === item.areaId).length + data.stories.filter((story) => story.id !== item.id && story.areaId === item.areaId).length,
};
for (const [type, items] of [["course", data.courses], ["area", data.areas], ["spot", data.spots], ["story", data.stories]]) {
  for (const item of items) if (linkCountFor[type](item) < 2) issue("warning", `${type}:${item.id}: fewer than 2 related internal-link candidates`);
}

const pagePolicies = [
  ["src/app/page.tsx", 1], ["src/app/courses/page.tsx", 1], ["src/app/courses/[id]/page.tsx", 1],
  ["src/app/areas/[id]/page.tsx", 1], ["src/app/spots/[id]/page.tsx", 1], ["src/app/stories/[id]/page.tsx", 2],
  ["src/app/plan/page.tsx", 0], ["src/app/map/page.tsx", 0], ["src/app/contact/page.tsx", 0],
  ["src/app/business/contact/page.tsx", 0], ["src/app/not-found.tsx", 0],
];
for (const [relativePath, limit] of pagePolicies) {
  const contents = readFileSync(join(root, relativePath), "utf8");
  const count = (contents.match(/<MonetizationSlot\b/g) || []).length;
  if (count > limit) issue("error", `${relativePath}: monetization slots ${count} exceed limit ${limit}`);
}

const monetizationSource = readFileSync(join(root, "src/content/monetization.ts"), "utf8");
if (!/sponsorEnabled:\s*false/.test(monetizationSource) || !/affiliateEnabled:\s*false/.test(monetizationSource) || !/adsenseEnabled:\s*false/.test(monetizationSource)) issue("warning", "A production monetization provider is enabled; verify approval and fixtures before release");
const inventory = JSON.parse(readFileSync(join(root, "src/content/monetization-inventory.json"), "utf8"));
if (inventory.sponsors.length) issue("warning", "Production sponsor inventory is not empty");
if (inventory.affiliates.length) issue("warning", "Production affiliate inventory is not empty");
const houseBlock = monetizationSource.match(/housePlacements:\s*\{([\s\S]*?)\n\s*\},\n\s*adsense:/)?.[1] ?? "";
const housePlacements = Object.fromEntries([...houseBlock.matchAll(/"([^"]+)":\s*(true|false)/g)].map((match) => [match[1], match[2] === "true"]));
const pageTypeByPlacement = {
  "home-after-courses": "home", "courses-after-grid": "courses", "course-detail-after-info": "course",
  "area-detail-after-courses": "area", "spot-detail-end": "spot", "story-middle": "story", "story-end": "story",
};
for (const configIssue of validateMonetizationInventory({ sponsors: inventory.sponsors, affiliates: inventory.affiliates, housePlacements, pageTypeByPlacement })) issue(configIssue.level, `${configIssue.code}: ${configIssue.message}`);

const reportPath = join(root, "reports", "revenue-quality-report.md");
mkdirSync(dirname(reportPath), { recursive: true });
writeFileSync(reportPath, `# Revenue quality report\n\nGenerated: ${new Date().toISOString()}\n\n- Errors: ${errors.length}\n- Warnings: ${warnings.length}\n\n${errors.length ? `## Errors\n\n${errors.map((item) => `- ${item}`).join("\n")}\n` : ""}${warnings.length ? `## Warnings\n\n${warnings.map((item) => `- ${item}`).join("\n")}\n` : ""}`);
if (errors.length) { console.error(errors.join("\n")); process.exit(1); }
console.log(`Revenue quality gate passed with ${warnings.length} warning(s). Report: reports/revenue-quality-report.md`);
