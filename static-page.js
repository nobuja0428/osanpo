(() => {
  const ANALYTICS = window.OSANPO_ANALYTICS || {
    trackEvent: () => false,
    trackPageView: () => false,
  };
  const FAVORITES = window.OSANPO_FAVORITES;
  const body = document.body;

  const trackEvent = (eventName, parameters = {}) => ANALYTICS.trackEvent(eventName, parameters);
  const datasetParameters = (element, group) => {
    const prefix = `track${group.charAt(0).toUpperCase()}${group.slice(1)}`;
    return Object.fromEntries(Object.entries(element.dataset)
      .filter(([key]) => key.startsWith(prefix) && key !== prefix)
      .map(([key, value]) => {
        const suffix = key.slice(prefix.length);
        const parameter = suffix.charAt(0).toLowerCase() + suffix.slice(1);
        return [parameter.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`), value];
      }));
  };

  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".site-nav");
  toggle?.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
    toggle.setAttribute("aria-label", isOpen ? "メニューを閉じる" : "メニューを開く");
  });

  document.querySelector(".skip-link")?.addEventListener("click", (event) => {
    event.preventDefault();
    const main = document.getElementById("main");
    if (!main) return;
    main.setAttribute("tabindex", "-1");
    main.focus({ preventScroll: true });
    main.scrollIntoView({ block: "start" });
  });

  const favoriteButton = document.querySelector("[data-static-favorite]");
  if (favoriteButton && FAVORITES) {
    const type = favoriteButton.dataset.favoriteType || "";
    const id = favoriteButton.dataset.favoriteId || "";
    const label = favoriteButton.dataset.favoriteLabel || "このページ";
    const update = () => {
      const active = FAVORITES.has(type, id);
      favoriteButton.classList.toggle("is-active", active);
      favoriteButton.setAttribute("aria-pressed", String(active));
      favoriteButton.setAttribute("aria-label", active ? `${label}をお気に入りから削除` : `${label}をお気に入りに追加`);
      favoriteButton.querySelector(".favorite-symbol").textContent = active ? "★" : "☆";
      favoriteButton.querySelector(".favorite-label").textContent = active ? "お気に入り済み" : "お気に入りに追加";
    };
    favoriteButton.addEventListener("click", () => {
      const active = FAVORITES.toggle(type, id);
      if (active === null) return;
      update();
      trackEvent("favorite_change", {
        content_type: type,
        content_id: id,
        action: active ? "add" : "remove",
      });
      const status = document.getElementById("favoriteStatus");
      if (status) status.textContent = active ? `${label}をお気に入りに追加しました。` : `${label}をお気に入りから削除しました。`;
    });
    update();
  }

  document.addEventListener("click", (event) => {
    const element = event.target.closest("a");
    if (!element) return;
    [
      ["map", "google_map_click"],
      ["official", "official_link_click"],
      ["food", "food_link_click"],
      ["transit", "transit_link_click"],
      ["contact", "contact_cta_click"],
    ].forEach(([group, eventName]) => {
      if (element.dataset[`track${group.charAt(0).toUpperCase()}${group.slice(1)}`] === "true") {
        trackEvent(eventName, datasetParameters(element, group));
      }
    });
  });

  const pageKey = body.dataset.pageKey || location.pathname;
  const routeName = body.dataset.routeName || "static_page";
  const sent = ANALYTICS.trackPageView({
    pageKey,
    pageTitle: document.title,
    pageLocation: location.href.split("#")[0],
    routeName,
  });
  if (!sent) return;

  const contentType = body.dataset.contentType || "";
  const contentId = body.dataset.contentId || "";
  const areaId = body.dataset.areaId || "";
  const eventNames = {
    area: "area_view",
    course: "course_view",
    spot: "spot_view",
    story: "story_view",
    advertise: "advertise_view",
    contact: "contact_view",
  };
  const eventName = eventNames[contentType];
  if (eventName) {
    trackEvent(eventName, {
      content_id: contentId,
      content_type: contentType,
      area_id: areaId,
      route_name: routeName,
    });
  }
})();
