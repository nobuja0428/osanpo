const script = `
(() => {
  const fixedRoutes = { "#/areas": "/areas/", "#/courses": "/courses/", "#/spots": "/spots/", "#/stories": "/stories/", "#/events": "/events/", "#/map": "/map/", "#/search": "/search/", "#/favorites": "/favorites/", "#/about": "/about/", "#/operation": "/operation/", "#/editorial-policy": "/editorial-policy/", "#/policy": "/editorial-policy/", "#/privacy": "/privacy/", "#/advertise": "/advertise/", "#/advertising": "/advertise/", "#/contact": "/contact/" };
  const redirectLegacyHash = () => {
    const hash = window.location.hash;
    if (!hash) return false;
    const clean = hash.split("?")[0]; let destination = fixedRoutes[clean];
    for (const [prefix, path] of [["#/area/", "/areas/"], ["#/course/", "/courses/"], ["#/spot/", "/spots/"], ["#/story/", "/stories/"]]) if (!destination && clean.startsWith(prefix)) destination = path + clean.slice(prefix.length) + "/";
    if (!destination) return false;
    const query = hash.includes("?") ? hash.slice(hash.indexOf("?") + 1).replace(/^keyword=/, "q=") : "";
    window.location.replace("/osanpo" + destination + (query ? "?" + query : ""));
    return true;
  };
  if (redirectLegacyHash()) return;
  window.addEventListener("hashchange", redirectLegacyHash);

  document.addEventListener("click", (event) => {
    const link = event.target.closest("a[data-analytics-event]");
    if (!link || typeof window.gtag !== "function") return;
    const name = link.dataset.analyticsEvent;
    if (!name || !/^[a-z][a-z0-9_]{0,39}$/.test(name)) return;
    const parameters = { content_id: link.dataset.contentId || "", page_type: link.dataset.pageType || "", area_id: link.dataset.areaId || "", route_segment: link.dataset.routeSegment || "", placement: link.dataset.placement || "", contact_type: link.dataset.contactType || "", duration_range: link.dataset.durationRange || "", budget_range: link.dataset.budgetRange || "", audience_type: link.dataset.audienceType || "", mood_type: link.dataset.moodType || "", result_count: Number(link.dataset.resultCount || 0), selected_stop_count: Number(link.dataset.selectedStopCount || 0), ad_type: link.dataset.adType || "", sponsor_id: link.dataset.sponsorId || "" };
    window.gtag("event", name, parameters);
    const secondaryName = link.dataset.analyticsSecondaryEvent;
    if (secondaryName && /^[a-z][a-z0-9_]{0,39}$/.test(secondaryName)) window.gtag("event", secondaryName, parameters);
    const tertiaryName = link.dataset.analyticsTertiaryEvent;
    if (tertiaryName && /^[a-z][a-z0-9_]{0,39}$/.test(tertiaryName)) window.gtag("event", tertiaryName, parameters);
  });

  const impressionSent = new WeakSet();
  const impressionObservers = new WeakMap();
  const publicationIsCurrent = (element) => {
    const now = Date.now();
    const start = element.dataset.startAt ? Date.parse(element.dataset.startAt) : undefined;
    const end = element.dataset.endAt ? Date.parse(element.dataset.endAt) : undefined;
    if (element.dataset.startAt && !Number.isFinite(start)) return false;
    if (element.dataset.endAt && !Number.isFinite(end)) return false;
    return (start === undefined || now >= start) && (end === undefined || now <= end);
  };
  const visibleRatio = (element) => {
    const rect = element.getBoundingClientRect();
    if (!rect.height || !rect.width) return 0;
    const visibleHeight = Math.max(0, Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0));
    const visibleWidth = Math.max(0, Math.min(rect.right, window.innerWidth) - Math.max(rect.left, 0));
    return (visibleHeight * visibleWidth) / (rect.height * rect.width);
  };
  const sendImpression = (element, ratio) => {
    if (impressionSent.has(element) || ratio < 0.5 || typeof window.gtag !== "function") return;
    const name = element.dataset.monetizationImpression;
    if (!name || !/^[a-z][a-z0-9_]{0,39}$/.test(name)) return;
    window.gtag("event", name, { ad_type: element.dataset.adType || "", placement: element.dataset.placement || "", sponsor_id: element.dataset.sponsorId || "", page_type: element.dataset.pageType || "", content_id: element.dataset.contentId || "", area_id: element.dataset.areaId || "" });
    impressionSent.add(element);
    impressionObservers.get(element)?.disconnect();
  };
  const initializeMonetization = () => document.querySelectorAll("[data-monetization-impression]").forEach((element) => {
    if (!publicationIsCurrent(element)) { element.remove(); return; }
    if (impressionObservers.has(element)) return;
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => sendImpression(entry.target, entry.intersectionRatio)), { threshold: 0.5 });
    impressionObservers.set(element, observer);
    observer.observe(element);
  });
  window.addEventListener("osanpo:analytics-ready", () => document.querySelectorAll("[data-monetization-impression]").forEach((element) => sendImpression(element, visibleRatio(element))));

  const initializeEnhancements = () => initializeMonetization();
  new MutationObserver(initializeEnhancements).observe(document.documentElement, { childList: true, subtree: true });
  const start = () => requestAnimationFrame(() => requestAnimationFrame(initializeEnhancements));
  if (document.readyState === "complete") start(); else window.addEventListener("load", start, { once: true });
})();`;

export function InlineEnhancements() {
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
