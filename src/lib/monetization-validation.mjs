export function validateMonetizationInventory({ sponsors, affiliates, housePlacements, pageTypeByPlacement }, now = new Date()) {
  const issues = [];
  const scopeCounts = new Map();
  const sponsorIds = new Set();
  for (const sponsor of sponsors.filter((item) => item.active)) {
    if (!sponsor.id || sponsorIds.has(sponsor.id)) issues.push({ level: "error", code: "sponsor-id", message: `${sponsor.id || "(empty)"}: sponsor id must be unique` });
    sponsorIds.add(sponsor.id);
    if (!sponsor.scopeType) issues.push({ level: "error", code: "sponsor-scope", message: `${sponsor.id}: scopeType is required` });
    if (sponsor.scopeType === "area" && (!sponsor.areaId || sponsor.contentId)) issues.push({ level: "error", code: "sponsor-scope", message: `${sponsor.id}: area scope requires areaId and no contentId` });
    if (["course", "story"].includes(sponsor.scopeType) && !sponsor.contentId) issues.push({ level: "error", code: "sponsor-scope", message: `${sponsor.id}: ${sponsor.scopeType} scope requires contentId` });
    if (sponsor.scopeType === "course" && sponsor.placements.some((placement) => placement !== "course-detail-after-info")) issues.push({ level: "error", code: "sponsor-scope-placement", message: `${sponsor.id}: course scope has an incompatible placement` });
    if (sponsor.scopeType === "story" && sponsor.placements.some((placement) => !["story-middle", "story-end"].includes(placement))) issues.push({ level: "error", code: "sponsor-scope-placement", message: `${sponsor.id}: story scope has an incompatible placement` });
    if (!/^https:\/\//.test(sponsor.href || "")) issues.push({ level: "error", code: "sponsor-url", message: `${sponsor.id}: HTTPS href is required` });
    const scope = sponsor.scopeType === "site" ? "site" : sponsor.scopeType === "area" ? `area:${sponsor.areaId}` : `${sponsor.scopeType}:${sponsor.contentId}`;
    scopeCounts.set(scope, (scopeCounts.get(scope) ?? 0) + 1);
    if (!Array.isArray(sponsor.placements) || sponsor.placements.length === 0) issues.push({ level: "error", code: "sponsor-placement", message: `${sponsor.id}: placement is required` });
    if (sponsor.startAt && !Number.isFinite(Date.parse(sponsor.startAt))) issues.push({ level: "error", code: "sponsor-start-date", message: `${sponsor.id}: startAt is invalid` });
    if (sponsor.endAt) {
      const end = Date.parse(sponsor.endAt);
      if (!Number.isFinite(end)) issues.push({ level: "error", code: "sponsor-end-date", message: `${sponsor.id}: endAt is invalid` });
      else if (end < now.getTime()) issues.push({ level: "warning", code: "sponsor-expired", message: `${sponsor.id}: sponsor publication has expired` });
    }
    if (sponsor.startAt && sponsor.endAt && Date.parse(sponsor.startAt) > Date.parse(sponsor.endAt)) issues.push({ level: "error", code: "sponsor-date-order", message: `${sponsor.id}: startAt is later than endAt` });
  }
  for (const [scope, count] of scopeCounts) if (count > 1) issues.push({ level: "error", code: "sponsor-count-limit", message: `${scope}: active sponsor count ${count} exceeds the limit of 1` });

  for (const affiliate of affiliates.filter((item) => item.active)) {
    if (!affiliate.contentId) issues.push({ level: "error", code: "affiliate-content", message: `${affiliate.id}: contentId is required for relevance` });
    if (!/^https:\/\//.test(affiliate.href || "")) issues.push({ level: "error", code: "affiliate-url", message: `${affiliate.id}: HTTPS href is required` });
    if (affiliate.startAt && !Number.isFinite(Date.parse(affiliate.startAt))) issues.push({ level: "error", code: "affiliate-start-date", message: `${affiliate.id}: startAt is invalid` });
    if (affiliate.endAt && !Number.isFinite(Date.parse(affiliate.endAt))) issues.push({ level: "error", code: "affiliate-end-date", message: `${affiliate.id}: endAt is invalid` });
    if (affiliate.startAt && affiliate.endAt && Date.parse(affiliate.startAt) > Date.parse(affiliate.endAt)) issues.push({ level: "error", code: "affiliate-date-order", message: `${affiliate.id}: startAt is later than endAt` });
  }

  const houseCounts = new Map();
  for (const [placement, enabled] of Object.entries(housePlacements)) {
    if (!enabled) continue;
    const pageType = pageTypeByPlacement[placement];
    if (!pageType) issues.push({ level: "error", code: "house-placement", message: `${placement}: page type is missing` });
    else houseCounts.set(pageType, (houseCounts.get(pageType) ?? 0) + 1);
  }
  for (const [pageType, count] of houseCounts) {
    const limit = pageType === "story" ? 2 : 1;
    if (count > limit) issues.push({ level: "error", code: "house-ad-density", message: `${pageType}: House Ad count ${count} exceeds ${limit}` });
  }
  return issues;
}
