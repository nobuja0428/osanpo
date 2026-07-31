import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import vm from "node:vm";

const root = process.cwd();
const source = readFileSync(join(root, "src/content/site-data.ts"), "utf8").replace("export const siteData", "globalThis.siteData");
const context = {};
vm.runInNewContext(source, context);
const siteData = context.siteData;
const catalog = JSON.parse(readFileSync(join(root, "src/content/verification-data.json"), "utf8"));
const sourceTypes = new Set(["official", "open-data", "rss", "api", "editorial"]);
const confidenceLevels = new Set(["high", "medium", "low"]);
const prohibited = /実際に歩いて確認しました|行って分かりました|食べてみました|おすすめします|絶対に楽しめます|必ず営業しています|最新です|完全ガイド/;
const groups = [["area", "areas", "name", "description"], ["course", "courses", "title", "summary"], ["spot", "spots", "name", "excerpt"], ["story", "stories", "title", "excerpt"], ["event", "events", "title", "venue"]];
const plural = { area: "areas", course: "courses", spot: "spots", story: "stories", event: "events" };
const errors = [];
const warnings = [];
const titles = new Set();
const canonicals = new Set();
const allKeys = new Set();
const issue = (level, message) => (level === "error" ? errors : warnings).push(message);
const validDate = (value) => Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(new Date(`${value}T00:00:00+09:00`).getTime()));

for (const [type, group, titleField, descriptionField] of groups) {
  for (const item of siteData[group]) {
    const key = `${type}:${item.id}`;
    allKeys.add(key);
    const verification = catalog[key];
    const title = String(item[titleField] || "").trim();
    const description = String(item[descriptionField] || "").trim();
    const canonical = `https://nobuja0428.github.io/osanpo/${plural[type]}/${item.id}/`;
    if (!title) issue("error", `${key}: title is required`);
    if (!description) issue("error", `${key}: description is required`);
    if (titles.has(title)) issue("error", `${key}: duplicate title`); else titles.add(title);
    if (canonicals.has(canonical)) issue("error", `${key}: duplicate canonical`); else canonicals.add(canonical);
    if (!item.image) issue("error", `${key}: image is required`);
    if (prohibited.test(JSON.stringify(item))) issue("error", `${key}: unsupported experience claim`);
    if (!verification) { issue("error", `${key}: verification is required`); continue; }
    for (const field of ["informationCheckedAt", "lastUpdatedAt"]) if (!validDate(verification[field])) issue("error", `${key}: ${field} is invalid`);
    if (verification.expiresAt && !validDate(verification.expiresAt)) issue("error", `${key}: expiresAt is invalid`);
    if (verification.expiresAt && verification.lastUpdatedAt > verification.expiresAt) issue("error", `${key}: expiresAt precedes lastUpdatedAt`);
    if (!confidenceLevels.has(verification.confidence)) issue("error", `${key}: confidence is invalid`);
    for (const field of ["fieldResearch", "aiAssisted", "estimated"]) if (typeof verification[field] !== "boolean") issue("error", `${key}: ${field} must be boolean`);
    if (!verification.internalPath?.startsWith("/")) issue("error", `${key}: internal path is required`);
    if (!Array.isArray(verification.officialSources) || verification.officialSources.length === 0) issue("error", `${key}: official source is required`);
    for (const sourceItem of verification.officialSources || []) if (!sourceItem.label || !String(sourceItem.url).startsWith("https://") || !sourceTypes.has(sourceItem.sourceType)) issue("error", `${key}: source is invalid`);
    if (verification.expiresAt && new Date(`${verification.expiresAt}T23:59:59+09:00`).getTime() < Date.now()) issue("warning", `${key}: expired; queued for recheck`);
    if (type === "event" && new Date(item.end).getTime() < new Date(item.start).getTime()) issue("error", `${key}: event end precedes start`);
  }
}

for (const key of Object.keys(catalog)) if (!allKeys.has(key)) issue("error", `${key}: verification has no content record`);
const reportPath = join(root, "reports", "content-quality-report.md");
mkdirSync(dirname(reportPath), { recursive: true });
writeFileSync(reportPath, `# Content quality report\n\nGenerated: ${new Date().toISOString()}\n\n- Errors: ${errors.length}\n- Warnings: ${warnings.length}\n\n${errors.length ? `## Errors\n\n${errors.map((item) => `- ${item}`).join("\n")}\n` : ""}${warnings.length ? `## Warnings\n\n${warnings.map((item) => `- ${item}`).join("\n")}\n` : ""}`);
if (errors.length) { console.error(errors.join("\n")); process.exit(1); }
console.log(`Content quality gate passed with ${warnings.length} warning(s). Report: reports/content-quality-report.md`);
