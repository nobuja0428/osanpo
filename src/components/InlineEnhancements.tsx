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
    const parameters = { content_id: link.dataset.contentId || "", page_type: link.dataset.pageType || "", placement: link.dataset.placement || "", provider: link.dataset.provider || "", category: link.dataset.category || "" };
    window.gtag("event", name, parameters);
  });

  const storageKey = "osanpoClubFavoritesV1";
  const read = () => { try { const value = JSON.parse(localStorage.getItem(storageKey) || "[]"); return Array.isArray(value) ? value.filter((item) => typeof item === "string") : []; } catch { return []; } };
  const render = (button, active) => { button.classList.toggle("is-active", active); button.setAttribute("aria-pressed", String(active)); button.innerHTML = '<span aria-hidden="true">' + (active ? "\\u2605" : "\\u2606") + "</span> " + (active ? "\\u304a\\u6c17\\u306b\\u5165\\u308a\\u6e08\\u307f" : "\\u304a\\u6c17\\u306b\\u5165\\u308a\\u306b\\u8ffd\\u52a0"); };
  const initialize = () => document.querySelectorAll("[data-favorite-key]").forEach((button) => {
    const key = button.dataset.favoriteKey;
    render(button, read().includes(key));
    button.addEventListener("click", () => {
      const current = read(); const active = !current.includes(key); const next = active ? [...current, key] : current.filter((item) => item !== key);
      localStorage.setItem(storageKey, JSON.stringify(next)); render(button, active);
      if (typeof window.gtag === "function") window.gtag("event", "favorite_change", { content_id: key, active });
    });
  });
  const start = () => requestAnimationFrame(() => requestAnimationFrame(initialize));
  if (document.readyState === "complete") start(); else window.addEventListener("load", start, { once: true });
})();`;

export function InlineEnhancements() {
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
