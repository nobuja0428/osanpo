(() => {
  const DATA = window.OSANPO_DATA;
  const CONFIG = window.OSANPO_CONFIG || {};
  const ANALYTICS = window.OSANPO_ANALYTICS || {
    isEnabled: () => false,
    trackEvent: () => false,
    trackPageView: () => false,
  };
  const FAVORITES = window.OSANPO_FAVORITES || {
    key: (type, id) => `${type}:${id}`,
    read: () => [],
    write: () => null,
  };
  const app = document.getElementById("app");
  const SITE_INFO = DATA.siteInfo || {};
  const img = (key) => DATA.images[key] || DATA.images.hero;
  const areaImageKeys = new Set(["areaKoenji", "areaKichijoji", "areaAsakusa"]);
  const courseImageKeys = new Set(["courseKoenji", "courseKichijoji", "courseAsakusa"]);
  const spotImageKeys = new Set(["spotKoenjiJunjo", "spotInokashiraPark", "spotSensoji", "spotKoenjiHikawa", "spotKichijojiArtMuseum", "spotKappabashi"]);
  const storyImageKeys = new Set(["storyKoenjiShoppingStreets", "storyInokashiraShortWalk", "storyAsakusaFirstHour"]);
  const eventImageKeys = new Set(["eventKagurazakaFestival", "eventShinjukuEisa", "eventSumidagawaFireworks", "eventKoganeiAwaodori"]);
  const courseFilterDefinitions = {
    area: {
      label: "エリア",
      options: { koenji: "高円寺", kichijoji: "吉祥寺", asakusa: "浅草" },
    },
    duration: {
      label: "所要時間",
      options: { 120: "2時間以内", 150: "2時間30分以内", 180: "3時間以内" },
    },
    budget: {
      label: "予算",
      options: { 2500: "2,500円以内", 3500: "3,500円以内", 4000: "4,000円以内" },
    },
    mood: {
      label: "気分・テーマ",
      options: { shopping: "商店街・買い物", vintage: "古着・路地", nature: "公園・水辺", cafe: "カフェ", history: "歴史・建築" },
    },
    audience: {
      label: "対象者",
      options: { solo: "一人", friends: "友人", date: "デート", family: "家族", sightseeing: "観光" },
    },
  };
  const courseFilterOrder = ["keyword", "area", "duration", "budget", "audience", "mood"];
  const courseImageAlt = (course, fallback) => course.imageAlt || fallback;
  const spotImageAlt = (spot) => spot.imageAlt || `${spot.name}周辺を表現したイメージ`;
  const storyImageAlt = (story, fallback) => story.imageAlt || fallback;
  const eventImageAlt = (event) => event.imageAlt || `${event.title}をイメージした画像`;
  const escapeHtml = (value = "") => String(value).replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char]));
  const trackingAttributes = (group, values = {}) => {
    const attributes = [`data-track-${group}="true"`];
    Object.entries(values).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") return;
      const kebabKey = key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
      attributes.push(`data-track-${group}-${kebabKey}="${escapeHtml(value)}"`);
    });
    return ` ${attributes.join(" ")}`;
  };
  const contentTypeForRecord = (record) => {
    if (DATA.areas.includes(record)) return "area";
    if (DATA.courses.includes(record)) return "course";
    if (DATA.spots.includes(record)) return "spot";
    if (DATA.stories.includes(record)) return "story";
    if (DATA.events.includes(record)) return "event";
    return "content";
  };
  const safeExternalUrl = (value = "") => {
    try {
      const url = new URL(value);
      return ["https:", "http:"].includes(url.protocol) ? url.href : "";
    } catch {
      return "";
    }
  };
  const safeHttpsSiteUrl = (value = "") => {
    try {
      const url = new URL(value);
      return url.protocol === "https:" ? url.href : "";
    } catch {
      return "";
    }
  };
  const safeGoogleFormUrl = (value = "") => {
    const url = safeExternalUrl(value);
    if (!url) return "";
    try {
      const parsed = new URL(url);
      const isGoogleForm = parsed.protocol === "https:"
        && (parsed.hostname === "forms.gle" || (parsed.hostname === "docs.google.com" && parsed.pathname.startsWith("/forms/")));
      return isGoogleForm ? parsed.href : "";
    } catch {
      return "";
    }
  };
  const configuredEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(CONFIG.contactEmail || "") && !/@example\.(com|jp)$/i.test(CONFIG.contactEmail) ? CONFIG.contactEmail : "";
  const configuredFormUrl = safeGoogleFormUrl(CONFIG.contactFormUrl);
  const configuredSiteUrl = safeHttpsSiteUrl(CONFIG.siteUrl);
  const basePath = `/${String(CONFIG.basePath || "/").replace(/^\/+|\/+$/g, "")}/`.replace("//", "/");
  const cleanRouteMap = {
    "": "",
    areas: "areas/",
    courses: "courses/",
    spots: "spots/",
    stories: "stories/",
    events: "events/",
    map: "map/",
    about: "about/",
    operation: "operation/",
    "editorial-policy": "editorial-policy/",
    policy: "editorial-policy/",
    privacy: "privacy/",
    advertise: "advertise/",
    advertising: "advertise/",
    contact: "contact/",
  };
  const cleanUrlFromHash = (hash) => {
    const match = String(hash || "").match(/^#\/(?:(area|course|spot|story)\/([a-z0-9-]+)|([a-z-]+))?$/);
    if (!match) return "";
    if (match[1] && match[2]) {
      const plural = { area: "areas", course: "courses", spot: "spots", story: "stories" }[match[1]];
      return `${basePath}${plural}/${match[2]}/`;
    }
    const route = match[3] || "";
    return Object.hasOwn(cleanRouteMap, route) ? `${basePath}${cleanRouteMap[route]}` : "";
  };
  const rewritePublicLinks = (html) => html.replace(/href="(#[^"]*)"/g, (attribute, hash) => {
    const cleanUrl = cleanUrlFromHash(hash);
    return cleanUrl ? `href="${cleanUrl}"` : attribute;
  });
  const trackEvent = (eventName, parameters = {}) => ANALYTICS.trackEvent(eventName, parameters);
  const mapsPlaceUrl = (query) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  const mapsEmbedUrl = (query) => `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
  const mapsTransitUrl = (destination) => {
    const params = new URLSearchParams({
      api: "1",
      destination,
      travelmode: "transit",
    });
    return `https://www.google.com/maps/dir/?${params.toString()}`;
  };
  const courseRouteStops = (course) => Array.isArray(course.routeStops) && course.routeStops.length
    ? [...course.routeStops].sort((a, b) => a.order - b.order)
    : course.stops.map((stop, index) => ({
      order: index + 1,
      name: stop.name,
      query: stop.query,
      role: index === 0 ? "start" : index === course.stops.length - 1 ? "goal" : "stop",
    }));
  const courseRouteSegmentStops = (course, segment) => {
    if (!segment || !Number.isInteger(segment.originStopOrder) || !Number.isInteger(segment.destinationStopOrder)) return [];
    const waypointOrders = Array.isArray(segment.waypointStopOrders) ? segment.waypointStopOrders : [];
    if (waypointOrders.length > 3) return [];
    const stops = courseRouteStops(course);
    const orders = [segment.originStopOrder, ...waypointOrders, segment.destinationStopOrder];
    const selected = orders.map((order) => stops.find((stop) => stop.order === order));
    return selected.every((stop) => stop?.query) ? selected : [];
  };
  const courseRouteUrl = (course, segment) => {
    const [origin, ...remaining] = courseRouteSegmentStops(course, segment);
    const destination = remaining.pop();
    if (!origin?.query || !destination?.query) return "";
    const params = new URLSearchParams({
      api: "1",
      travelmode: "walking",
      origin: origin.query,
      destination: destination.query,
    });
    if (remaining.length) params.set("waypoints", remaining.map((stop) => stop.query).join("|"));
    return `https://www.google.com/maps/dir/?${params.toString()}`;
  };
  const routeParts = () => location.hash.split("?")[0].replace(/^#\/?/, "").split("/").filter(Boolean);
  const courseFiltersToHash = (filters) => {
    const params = new URLSearchParams();
    courseFilterOrder.forEach((key) => {
      if (filters[key]) params.set(key, filters[key]);
    });
    const query = params.toString();
    return `#/courses${query ? `?${query}` : ""}`;
  };
  const readCourseFilters = () => {
    let params;
    try {
      params = new URLSearchParams(location.hash.split("?").slice(1).join("?"));
    } catch {
      params = new URLSearchParams();
    }
    const filters = {};
    const keyword = (params.get("keyword") || "").trim();
    if (keyword) filters.keyword = keyword;
    Object.entries(courseFilterDefinitions).forEach(([key, definition]) => {
      const value = params.get(key) || "";
      if (Object.hasOwn(definition.options, value)) filters[key] = value;
    });
    return filters;
  };
  const courseFilterLabel = (key, value) => key === "keyword"
    ? `キーワード：${value}`
    : `${courseFilterDefinitions[key].label}：${courseFilterDefinitions[key].options[value]}`;
  const eventState = (event, now = Date.now()) => {
    if (["中止", "延期", "終了", "情報更新待ち"].includes(event.status)) return event.status;
    const start = new Date(event.start).getTime();
    const end = new Date(event.end).getTime();
    if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) return "情報更新待ち";
    if (end < now) return "終了";
    if (!event.informationCheckedAt) return "情報更新待ち";
    if (start <= now) return "開催中";
    return "開催予定";
  };
  const featuredEvents = () => DATA.events
    .filter((event) => ["開催予定", "開催中"].includes(eventState(event)))
    .sort((a, b) => new Date(a.start) - new Date(b.start));
  const formatDateRange = (start, end) => {
    const s = new Date(start);
    const e = new Date(end);
    if (!Number.isFinite(s.getTime()) || !Number.isFinite(e.getTime())) return "日付未確認";
    const fmt = new Intl.DateTimeFormat("ja-JP", { month: "numeric", day: "numeric", weekday: "short", hour: "2-digit", minute: "2-digit" });
    return `${fmt.format(s)}〜${fmt.format(e)}`;
  };
  const imageDisclosure = "掲載画像には、街や散歩体験の雰囲気を表現するため、AI生成画像を使用しているものがあります。実際の街並み、店舗、施設の記録写真とは異なる場合があります。";
  const favoriteCollections = {
    area: DATA.areas,
    course: DATA.courses,
    spot: DATA.spots,
    story: DATA.stories,
  };

  function favoriteKey(type, id) {
    return FAVORITES.key(type, id);
  }

  function favoriteRecord(key) {
    if (typeof key !== "string") return null;
    const separator = key.indexOf(":");
    if (separator < 1) return null;
    const type = key.slice(0, separator);
    const id = key.slice(separator + 1);
    const record = favoriteCollections[type]?.find((item) => item.id === id);
    return record ? { key: favoriteKey(type, id), type, id, record } : null;
  }

  function favoriteLabel(type, record) {
    if (type === "area" || type === "spot") return record.name;
    return record.title;
  }

  function validFavoriteKeys(values) {
    if (!Array.isArray(values)) return [];
    const seen = new Set();
    return values.reduce((keys, value) => {
      const favorite = favoriteRecord(value);
      if (favorite && !seen.has(favorite.key)) {
        seen.add(favorite.key);
        keys.push(favorite.key);
      }
      return keys;
    }, []);
  }

  function loadFavorites() {
    return validFavoriteKeys(FAVORITES.read());
  }

  const favorites = new Set(loadFavorites());

  function saveFavorites() {
    const keys = validFavoriteKeys([...favorites]);
    favorites.clear();
    keys.forEach((key) => favorites.add(key));
    return FAVORITES.write(keys) !== null;
  }

  function isFavorite(type, id) {
    return favorites.has(favoriteKey(type, id));
  }

  function toggleFavorite(type, id) {
    const key = favoriteKey(type, id);
    if (!favoriteRecord(key)) return false;
    const active = !favorites.has(key);
    if (active) favorites.add(key);
    else favorites.delete(key);
    saveFavorites();
    return active;
  }

  function favoriteButton(type, id, label, detail = false) {
    const active = isFavorite(type, id);
    const action = active ? `${label}をお気に入りから削除` : `${label}をお気に入りに追加`;
    const detailLabel = active ? "お気に入り済み" : "お気に入りに追加";
    return `<button type="button" class="favorite-toggle${active ? " is-active" : ""}${detail ? " favorite-detail-action" : ""}" data-favorite-type="${escapeHtml(type)}" data-favorite-id="${escapeHtml(id)}" aria-pressed="${active}" aria-label="${escapeHtml(action)}" title="${escapeHtml(action)}"><span class="favorite-symbol" aria-hidden="true">${active ? "★" : "☆"}</span>${detail ? `<span class="favorite-label">${detailLabel}</span>` : ""}</button>`;
  }

  function getFavoriteRecords() {
    return [...favorites].map(favoriteRecord).filter(Boolean);
  }

  function imageMarkup(imageKey, alt, className = "") {
    const dimensions = areaImageKeys.has(imageKey)
      ? ' width="1200" height="800"'
      : courseImageKeys.has(imageKey) || spotImageKeys.has(imageKey) || storyImageKeys.has(imageKey) || eventImageKeys.has(imageKey) ? ' width="1200" height="900"' : "";
    return `<div class="${className}"><img loading="lazy" decoding="async"${dimensions} src="${img(imageKey)}" alt="${escapeHtml(alt)}"><span class="image-label">イメージ</span></div>`;
  }

  function header() {
    const route = routeParts()[0] || "home";
    const current = { area: "areas", course: "courses", spot: "spots" }[route] || route;
    const nav = [
      ["areas", "エリアから探す"],
      ["courses", "おさんぽコース"],
      ["spots", "スポット紹介"],
      ["map", "地図で探す"],
      ["favorites", "お気に入り"],
      ["about", "はじめての方"],
      ["contact", "お問い合わせ"],
    ];
    if (featuredEvents().length) nav.splice(3, 0, ["events", "イベント"]);
    return `
      <header class="site-header">
        <div class="container header-inner">
          <a class="brand" href="#/" aria-label="トップページ">
            <span class="brand-mark">歩</span>
            <span class="brand-copy"><strong>${escapeHtml(CONFIG.siteName || "おさんぽクラブ東京")}</strong><span>${escapeHtml(CONFIG.siteSubtitle || "Tokyo Sanpo Club")}</span></span>
          </a>
          <nav class="site-nav" id="siteNav" aria-label="メインナビゲーション">
            ${nav.map(([path, label]) => `<a href="#/${path}" ${current === path ? 'aria-current="page"' : ""}>${label}${path === "favorites" ? `<span class="favorite-count" aria-label="${getFavoriteRecords().length}件">${getFavoriteRecords().length}</span>` : ""}</a>`).join("")}
          </nav>
          <button class="nav-toggle" aria-label="メニューを開く" aria-controls="siteNav" aria-expanded="false">☰</button>
        </div>
      </header>
      <div class="sr-only" id="favoriteStatus" role="status" aria-live="polite" aria-atomic="true"></div>`;
  }

  function footer() {
    return `
      <footer class="site-footer">
        <div class="container footer-inner">
          <div><h3>おさんぽクラブ東京</h3><p>公開情報をもとに、AIによる構成・表現の補助も利用して東京の街歩きプランを編集するメディアです。${imageDisclosure}</p></div>
          <div><h3>探す</h3><div class="footer-links"><a href="#/areas">エリア</a><a href="#/courses">コース</a><a href="#/spots">スポット</a><a href="#/events">イベント</a><a href="#/map">お散歩マップ</a><a href="#/favorites">お気に入り</a></div></div>
          <div><h3>運営</h3><div class="footer-links"><a href="#/operation">運営情報</a><a href="#/editorial-policy">編集方針</a><a href="#/privacy">プライバシーポリシー</a><a href="#/advertise">広告掲載</a><a href="#/contact">お問い合わせ</a></div></div>
        </div>
        <div class="container footer-bottom">© 2026 おさんぽクラブ東京</div>
      </footer>`;
  }

  function breadcrumbs(items) {
    return `<nav class="breadcrumbs" aria-label="パンくず">${items.map((item, i) => i === items.length - 1 ? `<span aria-current="page">${escapeHtml(item.label)}</span>` : `<a href="${item.href}">${escapeHtml(item.label)}</a><span aria-hidden="true">›</span>`).join("")}</nav>`;
  }

  function trustPanel(record = {}, sources = []) {
    const meta = { ...SITE_INFO, ...record };
    const contentType = contentTypeForRecord(record);
    const sourceLinks = sources
      .map((source) => ({ label: source.label, url: safeExternalUrl(source.url) }))
      .filter((source) => source.url);
    return `<aside class="trust-panel" aria-label="情報の確認状態">
      <h2>情報の確認状態</h2>
      <dl class="trust-grid">
        <div><dt>最終更新日</dt><dd>${escapeHtml(meta.lastUpdated || "未記録")}</dd></div>
        <div><dt>情報確認日</dt><dd>${escapeHtml(meta.informationCheckedAt || "未記録")}</dd></div>
        <div><dt>現地取材</dt><dd>${meta.fieldResearch ? "あり" : "なし（現地確認予定）"}</dd></div>
        <div><dt>作成根拠</dt><dd>${meta.publicInfoBased === false ? "確認中" : "公開情報をもとに作成"}</dd></div>
        <div><dt>AI利用</dt><dd>${meta.aiAssisted === false ? "なし" : "構成・表現の補助に使用"}</dd></div>
        <div><dt>現地確認予定</dt><dd>${escapeHtml(meta.needsFieldCheck || "ルート、歩きやすさ、現地の最新状況")}</dd></div>
      </dl>
      <h3>参照した公式情報</h3>
      ${sourceLinks.length ? `<ul class="source-list">${sourceLinks.map((source) => `<li><a href="${source.url}" target="_blank" rel="noopener noreferrer"${trackingAttributes("official", { contentType, contentId: record.id, linkType: "source", areaId: record.areaId || (contentType === "area" ? record.id : "") })}>${escapeHtml(source.label)}</a></li>`).join("")}</ul>` : "<p>個別の参照先は未記録です。訪問前に施設・自治体等の公式情報をご確認ください。</p>"}
      <p class="image-disclosure">${imageDisclosure}</p>
    </aside>`;
  }

  function areaCard(area) {
    return `<article class="card card--favorite">
      <a class="card-link" href="#/area/${area.id}">
        ${imageMarkup(area.image, area.imageAlt, `card-media card-media--area area-media--${area.id}`)}
        <div class="card-body">
          <span class="card-kicker">${escapeHtml(area.ward)}</span>
          <h3>${escapeHtml(area.name)}</h3>
          <p>${escapeHtml(area.lead)}</p>
          <div class="card-meta"><span class="pill pill--green">${escapeHtml(area.publicationStatus)}</span>${area.tags.map((tag) => `<span class="pill">${escapeHtml(tag)}</span>`).join("")}</div>
        </div>
      </a>
      ${favoriteButton("area", area.id, area.name)}
    </article>`;
  }

  function courseCard(course) {
    const area = DATA.areas.find((a) => a.id === course.areaId);
    return `<article class="card card--favorite">
      <a class="card-link" href="#/course/${course.id}">
        ${imageMarkup(course.image, courseImageAlt(course, `${area.name}の散歩コースを表現したイメージ`), "card-media")}
        <div class="card-body">
          <span class="card-kicker">${escapeHtml(area.name)}</span>
          <h3>${escapeHtml(course.title)}</h3>
          <p>${escapeHtml(course.summary)}</p>
          <div class="card-meta"><span class="pill">${escapeHtml(course.distance)}</span><span class="pill">${escapeHtml(course.duration)}</span><span class="pill">予算目安 ${escapeHtml(course.budget)}</span><span class="pill">${escapeHtml(course.audience)}</span><span class="pill">${course.stops.length}地点</span></div>
        </div>
      </a>
      ${favoriteButton("course", course.id, course.title)}
    </article>`;
  }

  function spotCard(spot) {
    const area = DATA.areas.find((a) => a.id === spot.areaId);
    return `<article class="card card--favorite">
      <a class="card-link" href="#/spot/${spot.id}">
        ${imageMarkup(spot.image, spotImageAlt(spot), "card-media")}
        <div class="card-body">
          <span class="card-kicker">${escapeHtml(spot.category)}・${escapeHtml(area.name)}</span>
          <h3>${escapeHtml(spot.name)}</h3>
          <p>${escapeHtml(spot.excerpt)}</p>
        </div>
      </a>
      ${favoriteButton("spot", spot.id, spot.name)}
    </article>`;
  }

  function storyCard(story) {
    return `<article class="card card--favorite">
      <a class="card-link" href="#/story/${story.id}">
        ${imageMarkup(story.image, storyImageAlt(story, `${story.title}の内容を表現したイメージ`), "card-media")}
        <div class="card-body">
          <span class="card-kicker">${escapeHtml(story.category)}・${escapeHtml(story.readTime)}</span>
          <h3>${escapeHtml(story.title)}</h3>
          <p>${escapeHtml(story.excerpt)}</p>
        </div>
      </a>
      ${favoriteButton("story", story.id, story.title)}
    </article>`;
  }

  function eventCard(event, compact = false) {
    const state = eventState(event);
    const statusClass = state === "終了" ? "pill--ended" : state === "中止" ? "pill--cancelled" : state === "情報更新待ち" || state === "延期" ? "pill--pending" : "pill--accent";
    const officialUrl = safeExternalUrl(event.officialUrl);
    const areaId = DATA.areas.find((area) => area.name === event.area)?.id || "";
    return `<article class="${compact ? "event-row" : "card"}">
      ${compact ? `<div class="event-thumb">${imageMarkup(event.image, eventImageAlt(event), "")}</div>` : imageMarkup(event.image, eventImageAlt(event), "card-media")}
      <div class="${compact ? "" : "card-body"}">
        <span class="event-date">${formatDateRange(event.start, event.end)}</span>
        <h3>${escapeHtml(event.title)}</h3>
        <p>${escapeHtml(event.venue)}・${escapeHtml(event.price)}</p>
        <div class="card-meta"><span class="pill ${statusClass}">${escapeHtml(state)}</span><span class="pill">${escapeHtml(event.area)}</span></div>
        <p class="image-disclosure">情報確認日：${escapeHtml(event.informationCheckedAt || "未記録")}／最終更新日：${escapeHtml(event.lastUpdated || "未記録")}</p>
        <p class="image-disclosure">開催内容は変更・中止になる場合があります。最新情報は公式情報をご確認ください。</p>
      </div>
      ${compact ? `<div class="event-actions">${officialUrl ? `<a class="btn btn--small" href="${officialUrl}" target="_blank" rel="noopener noreferrer"${trackingAttributes("official", { contentType: "event", contentId: event.id, linkType: "official", areaId })}>公式情報</a>` : "<span>公式URL未登録</span>"}<a class="btn btn--small" href="${mapsPlaceUrl(event.mapQuery)}" target="_blank" rel="noopener noreferrer"${trackingAttributes("map", { linkType: "event", contentId: event.id, areaId })}>地図</a></div>` : ""}
    </article>`;
  }

  function homePage() {
    const events = featuredEvents().slice(0, 4);
    return `
      ${header()}
      <main id="main">
        <section class="hero">
          <div class="container">
            <div class="hero-frame">
              <img src="${img("hero")}" alt="東京の水辺と緑のある街歩きを表現したイメージ" width="1600" height="900" fetchpriority="high" decoding="async">
              <span class="image-label">イメージ</span>
              <div class="hero-copy">
                <span class="eyebrow">TOKYO SANPO CLUB</span>
                <h1>東京には、歩くと楽しい<br>まちがたくさんある。</h1>
                <p>下町の路地、個性あふれる商店街、緑豊かな公園や川沿いの道。お気に入りのエリアを見つけて、あなただけのおさんぽを。</p>
                <div class="hero-actions"><a class="btn btn--accent" href="#/courses">散歩コースを探す</a><a class="btn btn--ghost" href="#/areas">エリアから探す</a></div>
                <a class="hero-about-link" href="#/about">はじめての方へ →</a>
              </div>
            </div>
            <form class="search-panel search-panel--basic" id="heroSearch">
              <input class="form-control" name="keyword" aria-label="キーワード" placeholder="高円寺、喫茶店、雨の日…">
              <select class="form-control" name="area" aria-label="エリア"><option value="">すべてのエリア</option>${DATA.areas.map((a) => `<option value="${a.id}">${a.name}</option>`).join("")}</select>
              <button class="btn btn--dark" type="submit">探す</button>
            </form>
            <p class="course-detail-search-link"><a class="text-link" href="#/courses">所要時間・予算・気分からコースを詳しく探す →</a></p>
          </div>
        </section>

        <section class="section">
          <div class="container home-layout">
            <div>
              <div class="section-heading"><div><span class="eyebrow">AREAS</span><h2>エリアから探す</h2><p>${escapeHtml(SITE_INFO.expansionMessage)}</p></div><a class="text-link" href="#/areas">すべて見る →</a></div>
              <div class="availability-note"><strong>基本ガイド公開中：${SITE_INFO.publishedAreaCount}エリア</strong><span>その他${SITE_INFO.plannedAreaCount}エリアは記事準備中です。未公開ページへのリンクはありません。</span></div>
              <div class="grid grid--3">${DATA.areas.map(areaCard).join("")}</div>

              <div class="section-heading" style="margin-top:72px"><div><span class="eyebrow">COURSES</span><h2>おすすめのおさんぽコース</h2></div><a class="text-link" href="#/courses">コース一覧 →</a></div>
              <div class="grid grid--3">${DATA.courses.map(courseCard).join("")}</div>

              <div class="section-heading" style="margin-top:72px"><div><span class="eyebrow">STORIES</span><h2>街の読み物</h2></div><a class="text-link" href="#/stories">記事をもっと読む →</a></div>
              <div class="grid grid--3">${DATA.stories.map(storyCard).join("")}</div>

              <div class="section-heading" style="margin-top:72px"><div><span class="eyebrow">SPOTS</span><h2>注目のスポット</h2></div><a class="text-link" href="#/spots">すべて見る →</a></div>
              <div class="grid grid--3">${DATA.spots.slice(0, 6).map(spotCard).join("")}</div>
            </div>

            <aside class="sidebar-stack">
              <section class="sidebar-panel"><span class="eyebrow">MAP</span><h3>おさんぽマップ</h3><p>高円寺・吉祥寺・浅草の位置とルートをGoogleマップで確認できます。</p><iframe class="map-frame" loading="lazy" src="${mapsEmbedUrl("東京都 高円寺 吉祥寺 浅草")}" title="東京のお散歩マップ"></iframe><p><a class="btn btn--dark" href="#/map">地図ページを見る</a></p></section>
              <section class="sidebar-panel"><span class="eyebrow">EVENTS</span><h3>掲載イベント情報</h3>${events.length ? `<div class="event-list">${events.map((event) => `<a href="#/events"><strong>${escapeHtml(event.title)}</strong><br><span style="color:var(--muted);font-size:13px">${formatDateRange(event.start, event.end)}</span></a>`).join("<hr style='border:0;border-top:1px solid var(--line)'>")}</div><p><a class="text-link" href="#/events">すべて見る →</a></p>` : `<div class="empty-state">現在、確認済みのイベント情報はありません。新しい情報を確認後に掲載します。</div>`}</section>
            </aside>
          </div>
        </section>
      </main>
      ${footer()}`;
  }

  function listPage(type) {
    if (type === "courses") return courseListPage();
    const configs = {
      areas: ["エリアから探す", "東京の街を、雰囲気・所要時間・目的から選べます。", DATA.areas.map(areaCard)],
      spots: ["スポット紹介", "商店街、公園、神社、文化施設など、散歩に組み込みやすい場所を紹介します。", DATA.spots.map(spotCard)],
      stories: ["街の読み物", "ルート一覧だけでなく、街を歩く理由と楽しみ方を読み物として紹介します。", DATA.stories.map(storyCard)],
    };
    const [title, lead, cards] = configs[type];
    const areaNotice = type === "areas" ? `<div class="availability-note"><strong>${escapeHtml(SITE_INFO.expansionMessage)}</strong><span>現在は高円寺・吉祥寺・浅草の基本ガイドを公開中。その他${SITE_INFO.plannedAreaCount}エリアは記事準備中です。</span></div>` : "";
    return `${header()}<main id="main"><section class="page-hero"><div class="container">${breadcrumbs([{ href: "#/", label: "トップ" }, { label: title }])}<span class="eyebrow">DISCOVER TOKYO</span><h1>${title}</h1><p>${lead}</p></div></section><section class="section section--compact"><div class="container">${areaNotice}<div class="grid grid--3">${cards.join("")}</div></div></section></main>${footer()}`;
  }

  function courseFilterSelect(name, label, emptyLabel, options, selectedValue) {
    return `<div class="course-filter-group">
      <label for="course-filter-${name}">${label}</label>
      <select class="form-control" id="course-filter-${name}" name="${name}">
        <option value="">${emptyLabel}</option>
        ${Object.entries(options).map(([value, optionLabel]) => `<option value="${value}"${selectedValue === value ? " selected" : ""}>${optionLabel}</option>`).join("")}
      </select>
    </div>`;
  }

  function courseListPage() {
    const filters = readCourseFilters();
    const canonicalHash = courseFiltersToHash(filters);
    if (location.hash !== canonicalHash) history.replaceState(null, "", canonicalHash);

    const filteredCourses = DATA.courses.filter((course) => {
      const area = DATA.areas.find((item) => item.id === course.areaId);
      const searchableText = [
        course.title,
        course.summary,
        area?.name || "",
        course.audience,
        course.stops.map((stop) => `${stop.name} ${stop.category}`).join(" "),
        course.moodKeys.map((key) => courseFilterDefinitions.mood.options[key] || "").join(" "),
      ].join(" ").toLowerCase();
      const keywordMatches = !filters.keyword || searchableText.includes(filters.keyword.toLowerCase());
      return keywordMatches
        && (!filters.area || course.areaId === filters.area)
        && (!filters.duration || course.durationMinutes <= Number(filters.duration))
        && (!filters.budget || course.budgetMaxYen <= Number(filters.budget))
        && (!filters.mood || course.moodKeys.includes(filters.mood))
        && (!filters.audience || course.audienceKeys.includes(filters.audience));
    });

    const selectedFilters = courseFilterOrder
      .filter((key) => filters[key])
      .map((key) => {
        const label = courseFilterLabel(key, filters[key]);
        return `<button class="filter-chip" type="button" data-course-filter-remove="${key}" aria-label="${escapeHtml(label)}を解除"><span>${escapeHtml(label)}</span><span aria-hidden="true">×</span></button>`;
      })
      .join("");
    const selectedPanel = selectedFilters
      ? `<section class="active-filters" aria-labelledby="active-course-filters-title"><h2 id="active-course-filters-title">選択中の条件</h2><div class="filter-chip-list">${selectedFilters}</div><a class="text-link" href="#/courses" data-course-filter-clear>条件をすべて解除する</a></section>`
      : "";
    const resultMessage = filteredCourses.length
      ? `${filteredCourses.length}件のコースがあります`
      : "条件に合うコースはありませんでした";
    const results = filteredCourses.length
      ? `<div class="grid grid--3">${filteredCourses.map(courseCard).join("")}</div>`
      : `<div class="empty-state"><h2>条件に合うコースはありませんでした</h2><p>条件を一つずつ解除するか、すべてのコースをご確認ください。</p><div class="empty-actions"><a class="btn btn--accent" href="#/courses" data-course-filter-clear>条件をすべて解除する</a><a class="btn" href="#/areas">エリア一覧へ戻る</a><a class="btn" href="#/courses" data-course-filter-clear>すべてのコースを見る</a></div></div>`;

    return `${header()}<main id="main"><section class="page-hero"><div class="container">${breadcrumbs([{ href: "#/", label: "トップ" }, { label: "おさんぽコース" }])}<span class="eyebrow">DISCOVER TOKYO</span><h1>おさんぽコース</h1><p>STARTからGOALまで、実在地点とGoogleマップで確認できます。</p></div></section><section class="section section--compact"><div class="container">
      <form class="course-filter-panel" id="courseFilters">
        <fieldset>
          <legend>条件から散歩コースを探す</legend>
          <p class="course-filter-intro">所要時間、予算、気分・テーマ、歩く相手から絞り込めます。</p>
          <div class="course-filter-grid">
            <div class="course-filter-group course-filter-group--keyword">
              <label for="course-filter-keyword">キーワード</label>
              <input class="form-control" id="course-filter-keyword" name="keyword" value="${escapeHtml(filters.keyword || "")}" placeholder="商店街、公園、カフェ…">
            </div>
            ${courseFilterSelect("area", "エリア", "すべて", courseFilterDefinitions.area.options, filters.area)}
            ${courseFilterSelect("duration", "所要時間", "指定なし", courseFilterDefinitions.duration.options, filters.duration)}
            ${courseFilterSelect("budget", "予算", "指定なし", courseFilterDefinitions.budget.options, filters.budget)}
            ${courseFilterSelect("mood", "気分・テーマ", "指定なし", courseFilterDefinitions.mood.options, filters.mood)}
            ${courseFilterSelect("audience", "対象者", "指定なし", courseFilterDefinitions.audience.options, filters.audience)}
          </div>
          <div class="course-filter-actions"><button class="btn btn--dark" type="submit">この条件で探す</button><a class="text-link" href="#/courses" data-course-filter-clear>条件をすべて解除する</a></div>
        </fieldset>
      </form>
      ${selectedPanel}
      <p class="course-result-count" id="courseResultCount">${resultMessage}</p>
      ${results}
    </div></section></main>${footer()}`;
  }

  function favoritesPage() {
    const records = getFavoriteRecords();
    const groups = [
      ["area", "エリア", areaCard],
      ["course", "散歩コース", courseCard],
      ["spot", "スポット", spotCard],
      ["story", "街の読み物", storyCard],
    ];
    const sections = groups.map(([type, title, card]) => {
      const items = records.filter((favorite) => favorite.type === type);
      return items.length ? `<section class="favorites-section"><h2>${title}</h2><div class="grid grid--3">${items.map((favorite) => card(favorite.record)).join("")}</div></section>` : "";
    }).join("");
    const emptyState = `<div class="empty-state"><h2>まだお気に入りはありません</h2><p>気になるエリアや散歩コース、スポット、読み物を保存すると、ここでまとめて確認できます。</p><div class="empty-actions"><a class="btn btn--accent" href="#/areas">エリアから探す</a><a class="btn" href="#/courses">散歩コースを探す</a><a class="btn" href="#/spots">スポットを見る</a><a class="btn" href="#/stories">読み物を見る</a></div></div>`;
    return `${header()}<main id="main"><section class="page-hero"><div class="container">${breadcrumbs([{ href: "#/", label: "トップ" }, { label: "お気に入り" }])}<span class="eyebrow">FAVORITES</span><h1>お気に入り</h1><p>保存したエリア、散歩コース、スポット、街の読み物をまとめて確認できます。</p></div></section><section class="section section--compact"><div class="container">${records.length ? sections : emptyState}</div></section></main>${footer()}`;
  }

  function areaPage(id) {
    const area = DATA.areas.find((a) => a.id === id);
    if (!area) return notFound();
    const courses = DATA.courses.filter((c) => c.areaId === id);
    const spots = DATA.spots.filter((s) => s.areaId === id);
    const stories = DATA.stories.filter((s) => s.areaId === id);
    return `${header()}<main id="main">
      <section class="page-hero"><div class="container">${breadcrumbs([{ href: "#/", label: "トップ" }, { href: "#/areas", label: "エリア" }, { label: area.name }])}<div class="page-hero-inner"><div><span class="eyebrow">${area.ward}</span><h1>${area.name}</h1>${favoriteButton("area", area.id, area.name, true)}<p>${area.description}</p><div class="card-meta"><span class="pill pill--green">${area.publicationStatus}</span><span class="pill">${area.duration}</span><span class="pill">${area.budget}</span>${area.tags.map((t) => `<span class="pill pill--green">${t}</span>`).join("")}</div><p style="margin-top:24px"><a class="btn btn--accent" href="#/map/${area.id}">地図で見る</a></p></div>${imageMarkup(area.image, area.imageAlt, `page-hero-media area-media--${area.id}`)}</div>${trustPanel(area, area.officialSources)}</div></section>
      <section class="section section--surface"><div class="container"><div class="section-heading"><div><span class="eyebrow">COURSES</span><h2>${area.name}のおさんぽコース</h2></div></div><div class="grid grid--3">${courses.map(courseCard).join("")}</div></div></section>
      <section class="section"><div class="container"><div class="section-heading"><div><span class="eyebrow">SPOTS</span><h2>立ち寄りたい場所</h2></div></div><div class="grid grid--3">${spots.map(spotCard).join("")}</div></div></section>
      <section class="section section--soft"><div class="container"><div class="section-heading"><div><span class="eyebrow">STORIES</span><h2>${area.name}を読む</h2></div></div><div class="grid grid--3">${stories.map(storyCard).join("")}</div></div></section>
    </main>${footer()}`;
  }

  function courseRouteStopList(course) {
    const stops = courseRouteStops(course);
    return `<ol class="stop-list route-stop-list">${stops.map((stop) => {
      const existingStop = course.stops[stop.order - 1];
      const detail = stop.role === "start" ? "START" : stop.role === "goal" ? "GOAL" : existingStop?.category || "";
      return `<li class="stop-card"><span class="stop-number" aria-hidden="true">${stop.order}</span><div><strong>${escapeHtml(stop.name)}</strong><span>${escapeHtml(detail)}</span></div><a class="btn btn--small" href="${mapsPlaceUrl(stop.query)}" target="_blank" rel="noopener noreferrer"${trackingAttributes("map", { linkType: "course_stop", contentId: course.id, areaId: course.areaId, courseId: course.id, stopOrder: stop.order })}>Googleマップで地点を開く</a></li>`;
    }).join("")}</ol>`;
  }

  function courseRouteGuide(course, area) {
    const segments = Array.isArray(course.routeSegments) ? course.routeSegments : [];
    return `<div class="course-route-guide"><h3>Googleマップで歩く</h3><p class="route-guide-intro">スマートフォンでも地点が欠落しないよう、前半と後半に分けています。</p><div class="route-segment-list">${segments.map((segment) => {
      const stops = courseRouteSegmentStops(course, segment);
      const origin = stops[0];
      const destination = stops[stops.length - 1];
      const url = courseRouteUrl(course, segment);
      if (!origin || !destination || !url) return "";
      const linkType = segment.label === "前半" ? "course_route_first" : segment.label === "後半" ? "course_route_second" : "course_route";
      return `<div class="route-segment"><a class="btn btn--accent" href="${url}" target="_blank" rel="noopener noreferrer"${trackingAttributes("map", { linkType, contentId: course.id, areaId: area.id, courseId: course.id, stopOrder: origin.order })}>${escapeHtml(segment.label)}ルートをGoogleマップで開く</a><small><strong>${escapeHtml(area.name)}${escapeHtml(segment.label)}</strong><span>START：${escapeHtml(origin.name)} → GOAL：${escapeHtml(destination.name)}</span></small></div>`;
    }).join("")}</div><p class="route-notice">${escapeHtml(course.routeNotice || "Googleマップの徒歩経路は変更される場合があります。現地の案内と最新情報をご確認ください。")}</p></div>`;
  }

  const toiletTypeLabels = {
    public: "公衆トイレ",
    park: "公園トイレ",
    "public-facility": "公共施設トイレ",
    partner: "協力施設",
  };
  const toiletRoutePartLabels = {
    first: "前半ルート",
    second: "後半ルート",
    start: "START付近",
    goal: "GOAL付近",
  };
  const toiletStatusLabels = {
    available: "使用可能（公式掲載あり）",
    "temporarily-closed": "一時閉鎖情報あり",
    "information-pending": "最新状況は要確認",
  };
  const toiletEquipmentLabel = (value) => value === true ? "あり" : value === false ? "なし" : "情報なし";
  const practicalInfoDate = (value) => {
    const text = String(value || "");
    const full = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (full) return `${Number(full[1])}年${Number(full[2])}月${Number(full[3])}日`;
    const month = text.match(/^(\d{4})-(\d{2})$/);
    if (month) return `${Number(month[1])}年${Number(month[2])}月`;
    return text || "情報なし";
  };
  const transitLinkLabels = {
    station: "公式駅情報",
    timetable: "公式時刻表",
    operation: "公式運行情報",
    map: "構内図・出口案内",
    barrier: "バリアフリー情報",
  };
  const transitOperatorLinks = (access, operator, primaryTimetableUrl) => {
    const areaId = DATA.courses.find((course) => course.id === access.courseId)?.areaId || "";
    const candidates = [
      { type: "station", url: operator.stationPageUrl },
      { type: "timetable", url: operator.timetableUrl },
      { type: "operation", url: operator.operationInfoUrl },
      { type: "map", url: operator.stationMapUrl },
      { type: "barrier", url: operator.barrierFreeUrl },
    ];
    const grouped = new Map();
    candidates.forEach(({ type, url }) => {
      const safeUrl = safeExternalUrl(url || "");
      if (!safeUrl || (type === "timetable" && safeUrl === primaryTimetableUrl)) return;
      const current = grouped.get(safeUrl) || [];
      current.push(transitLinkLabels[type]);
      grouped.set(safeUrl, current);
    });
    return [...grouped.entries()].map(([url, labels]) => {
      const label = [...new Set(labels)].join("／");
      return `<a href="${url}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(access.stationName)}の${escapeHtml(operator.name)}${escapeHtml(label)}を開く（外部サイト）"${trackingAttributes("transit", { transitId: access.id, courseId: access.courseId, role: access.role, linkType: "official" })}${trackingAttributes("official", { contentType: "transit", contentId: access.id, linkType: "official", areaId })}>${escapeHtml(label)} <span aria-hidden="true">↗</span></a>`;
    }).join("");
  };
  const transitOperator = (access, operator, primaryTimetableUrl) => {
    const lines = Array.isArray(operator.lines) ? operator.lines.filter(Boolean).join("／") : "";
    const links = transitOperatorLinks(access, operator, primaryTimetableUrl);
    return `<section class="transit-operator" aria-label="${escapeHtml(access.stationName)}の${escapeHtml(operator.name)}公式情報">
      <h5>${escapeHtml(operator.name)}</h5>
      <p>${escapeHtml(lines || "路線情報なし")}</p>
      <div class="transit-official-links">${links || "<span>公式リンクは確認中です。</span>"}</div>
    </section>`;
  };
  const transitAlternativeStations = (access) => {
    const alternatives = Array.isArray(access.alternativeStations) ? access.alternativeStations : [];
    if (!alternatives.length) return "";
    const areaId = DATA.courses.find((course) => course.id === access.courseId)?.areaId || "";
    return `<section class="transit-alternatives" aria-labelledby="transit-alternatives-${escapeHtml(access.id)}">
      <h5 id="transit-alternatives-${escapeHtml(access.id)}">その他のアクセス</h5>
      <p>浅草には場所の異なる複数の「浅草駅」があります。利用する鉄道会社と駅位置をご確認ください。</p>
      <ul>${alternatives.map((station) => {
        const stationUrl = safeExternalUrl(station.stationPageUrl || "");
        const mapUrl = safeExternalUrl(mapsPlaceUrl(station.mapQuery || ""));
        const code = station.stationCode ? ` <span>${escapeHtml(station.stationCode)}</span>` : "";
        return `<li><div><strong>${escapeHtml(station.stationName)}</strong>${code}<small>${escapeHtml(station.operatorName || "")}</small></div><div>${stationUrl ? `<a href="${stationUrl}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(station.stationName)}の公式駅情報を開く（外部サイト）"${trackingAttributes("transit", { transitId: access.id, courseId: access.courseId, role: access.role, linkType: "alternative_official" })}${trackingAttributes("official", { contentType: "transit", contentId: access.id, linkType: "alternative_station", areaId })}>公式駅情報 <span aria-hidden="true">↗</span></a>` : ""}${mapUrl ? `<a href="${mapUrl}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(station.stationName)}をGoogleマップで開く（外部サイト）"${trackingAttributes("map", { linkType: "alternative_station", contentId: access.id, areaId, courseId: access.courseId })}${trackingAttributes("transit", { transitId: access.id, courseId: access.courseId, role: access.role, linkType: "map" })}>Googleマップ <span aria-hidden="true">↗</span></a>` : ""}</div></li>`;
      }).join("")}</ul>
    </section>`;
  };
  function transitCard(access) {
    const operators = Array.isArray(access.operators) ? access.operators : [];
    const areaId = DATA.courses.find((course) => course.id === access.courseId)?.areaId || "";
    const mapUrl = safeExternalUrl(mapsPlaceUrl(access.mapQuery || ""));
    const transitUrl = access.role === "arrival" ? safeExternalUrl(mapsTransitUrl(access.mapQuery || "")) : "";
    const primaryTimetableUrl = access.role === "return"
      ? safeExternalUrl(operators.find((operator) => safeExternalUrl(operator.timetableUrl || ""))?.timetableUrl || "")
      : "";
    const primaryAction = access.role === "arrival"
      ? transitUrl && `<a class="btn btn--accent transit-primary-action" href="${transitUrl}" target="_blank" rel="noopener noreferrer" aria-label="現在地から${escapeHtml(access.stationName)}までの公共交通経路をGoogleマップで調べる（外部サイト）"${trackingAttributes("map", { linkType: "transit_route", contentId: access.id, areaId, courseId: access.courseId })}${trackingAttributes("transit", { transitId: access.id, courseId: access.courseId, role: access.role, linkType: "route" })}>現在地から電車経路を調べる <span aria-hidden="true">↗</span></a>`
      : primaryTimetableUrl && `<a class="btn btn--accent transit-primary-action" href="${primaryTimetableUrl}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(access.stationName)}の公式時刻表を開く（外部サイト）"${trackingAttributes("transit", { transitId: access.id, courseId: access.courseId, role: access.role, linkType: "timetable" })}${trackingAttributes("official", { contentType: "transit", contentId: access.id, linkType: "timetable", areaId })}>公式時刻表を見る <span aria-hidden="true">↗</span></a>`;
    const exitText = access.exitVerified === true && access.recommendedExit
      ? `<p class="transit-exit"><span>おすすめ出口</span><strong>${escapeHtml(access.recommendedExit)}</strong></p>`
      : `<p class="transit-exit transit-exit--unverified"><span>出口案内</span><strong>出口は公式構内図をご確認ください</strong></p>`;
    return `<article class="transit-card" aria-labelledby="transit-${escapeHtml(access.id)}">
      <div class="transit-card-head">
        <span class="transit-role">${escapeHtml(access.roleLabel || (access.role === "arrival" ? "行き" : "帰り"))}</span>
        <span class="transit-course-role">${access.role === "arrival" ? "STARTへ" : "GOALから"}</span>
      </div>
      <h4 id="transit-${escapeHtml(access.id)}">${escapeHtml(access.stationName)}${access.stationCode ? `<span>${escapeHtml(access.stationCode)}</span>` : ""}</h4>
      <p class="transit-connection">${escapeHtml(access.routeConnection || "")}</p>
      ${exitText}
      <div class="transit-actions">${primaryAction || ""}${mapUrl ? `<a class="btn" href="${mapUrl}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(access.stationName)}をGoogleマップで開く（外部サイト）"${trackingAttributes("map", { linkType: "station", contentId: access.id, areaId, courseId: access.courseId })}${trackingAttributes("transit", { transitId: access.id, courseId: access.courseId, role: access.role, linkType: "map" })}>駅をGoogleマップで開く <span aria-hidden="true">↗</span></a>` : ""}</div>
      <div class="transit-official">
        <h5>駅の公式情報</h5>
        ${operators.map((operator) => transitOperator(access, operator, primaryTimetableUrl)).join("")}
      </div>
      ${transitAlternativeStations(access)}
      <div class="transit-meta">
        <span>情報確認日：${escapeHtml(practicalInfoDate(access.informationCheckedAt))}</span>
        <span>公式情報をもとに作成</span>
        <span>${access.fieldResearch === false ? "現地確認なし" : "現地確認あり"}</span>
      </div>
    </article>`;
  }
  const toiletAvailableTime = (toilet) => {
    if (toilet.availableTimeNote) return toilet.availableTimeNote;
    if (toilet.availableStartTime && toilet.availableEndTime) return `${toilet.availableStartTime}〜${toilet.availableEndTime}`;
    if (toilet.availableStartTime) return `${toilet.availableStartTime}から`;
    if (toilet.availableEndTime) return `${toilet.availableEndTime}まで`;
    return "情報なし";
  };

  function toiletCard(toilet) {
    const areaId = DATA.courses.find((course) => course.id === toilet.courseId)?.areaId || "";
    const mapUrl = safeExternalUrl(mapsPlaceUrl(toilet.mapQuery || ""));
    const sourceUrl = safeExternalUrl(toilet.sourceUrl || toilet.officialUrl || "");
    const datasetUrl = safeExternalUrl(toilet.datasetUrl || "");
    const routePart = toiletRoutePartLabels[toilet.routePart] || "区間情報なし";
    const status = toiletStatusLabels[toilet.status] || "最新状況は要確認";
    const closedNotice = toilet.status === "temporarily-closed"
      ? `<p class="toilet-status-note">現在、工事等により利用できない可能性があります。</p>`
      : "";
    const usageNote = toilet.usageNote ? `<p class="toilet-usage-note">${escapeHtml(toilet.usageNote)}</p>` : "";
    const attributionNote = toilet.sourceAttributionNote ? `<p>${escapeHtml(toilet.sourceAttributionNote)}</p>` : "";
    const datasetLink = datasetUrl && datasetUrl !== sourceUrl
      ? `<a href="${datasetUrl}" target="_blank" rel="noopener noreferrer"${trackingAttributes("official", { contentType: "toilet", contentId: toilet.id, linkType: "dataset", areaId })}>元データを見る（外部サイト）</a>`
      : "";
    return `<li class="toilet-card">
      <article aria-labelledby="toilet-${escapeHtml(toilet.id)}">
        <div class="toilet-card-head">
          <span class="toilet-type">${escapeHtml(toiletTypeLabels[toilet.type] || "トイレ")}</span>
          <span class="toilet-status">${escapeHtml(status)}</span>
        </div>
        <h4 id="toilet-${escapeHtml(toilet.id)}">${escapeHtml(toilet.name)}</h4>
        <p class="toilet-location"><strong>コース${escapeHtml(toilet.nearStopOrder)}番・${escapeHtml(toilet.nearStopName)}付近</strong><span>${escapeHtml(toilet.locationNote || "位置補足は情報なし")}</span></p>
        <p class="toilet-route-part">${escapeHtml(routePart)}</p>
        ${mapUrl ? `<a class="btn btn--accent toilet-map-link" href="${mapUrl}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(toilet.name)}をGoogleマップで開く（外部サイト）"${trackingAttributes("map", { linkType: "toilet", contentId: toilet.id, areaId, courseId: toilet.courseId, stopOrder: toilet.nearStopOrder })}>Googleマップで開く <span aria-hidden="true">↗</span></a>` : ""}
        <dl class="toilet-facts">
          <div><dt>所在地</dt><dd>${escapeHtml(toilet.address || "情報なし")}</dd></div>
          <div><dt>利用時間</dt><dd>${escapeHtml(toiletAvailableTime(toilet))}</dd></div>
        </dl>
        <div class="toilet-equipment" aria-label="${escapeHtml(toilet.name)}の設備情報">
          <span>車いす対応：${escapeHtml(toiletEquipmentLabel(toilet.wheelchair))}</span>
          <span>オストメイト：${escapeHtml(toiletEquipmentLabel(toilet.ostomate))}</span>
          <span>乳幼児設備：${escapeHtml(toiletEquipmentLabel(toilet.infantFacilities))}</span>
        </div>
        ${closedNotice}${usageNote}
        <div class="toilet-source">
          <p>出典：${escapeHtml(toilet.sourceName || "情報なし")}</p>
          <p>ライセンス：${escapeHtml(toilet.sourceLicense || "情報なし")}</p>
          <p>データ更新日：${escapeHtml(practicalInfoDate(toilet.sourceUpdatedAt))}／サイト確認日：${escapeHtml(practicalInfoDate(toilet.informationCheckedAt))}</p>
          ${attributionNote}
          <div>${sourceUrl ? `<a href="${sourceUrl}" target="_blank" rel="noopener noreferrer"${trackingAttributes("official", { contentType: "toilet", contentId: toilet.id, linkType: "source", areaId })}>公式情報・出典を見る（外部サイト）</a>` : "<span>公式情報URL：情報なし</span>"}${datasetLink}</div>
        </div>
      </article>
    </li>`;
  }

  const foodRoleLabels = {
    "short-break": "ひと休み",
    "cafe-break": "カフェ休憩",
    meal: "食事",
    takeout: "テイクアウト",
  };
  const foodServicePeriodLabels = {
    breakfast: "朝",
    lunch: "ランチ",
    cafe: "カフェ",
    dinner: "ディナー",
    takeout: "テイクアウト",
  };
  const foodServiceValueLabel = (value) => value === true
    ? "公式情報で対応を確認"
    : value === false
      ? "公式情報では非対応"
      : "情報なし";
  const foodStatusLabels = {
    "temporarily-closed": "一時休業の可能性",
    "information-pending": "営業情報を確認中",
  };
  const foodRoutePartLabels = {
    start: "START付近",
    first: "前半ルート",
    second: "後半ルート",
    goal: "GOAL付近",
  };

  function foodBreakCard(food) {
    const areaId = DATA.courses.find((course) => course.id === food.courseId)?.areaId || "";
    const mapUrl = safeExternalUrl(mapsPlaceUrl(food.mapQuery || ""));
    const officialUrl = safeExternalUrl(food.officialUrl || "");
    const menuUrl = safeExternalUrl(food.menuUrl || "");
    const reservationUrl = safeExternalUrl(food.reservationUrl || "");
    const tabelogUrl = safeExternalUrl(food.tabelogUrl || "");
    const periods = Array.isArray(food.servicePeriods)
      ? food.servicePeriods.map((period) => foodServicePeriodLabels[period]).filter(Boolean)
      : [];
    const serviceFacts = [
      ["テイクアウト", food.takeout],
      ["予約", food.reservation],
      ["ベジタリアン", food.vegetarian],
    ];
    const status = foodStatusLabels[food.status];
    return `<li class="food-break-card">
      <article aria-labelledby="food-break-${escapeHtml(food.id)}">
        <div class="food-break-card-head">
          <span class="food-break-role">${escapeHtml(food.roleLabel || foodRoleLabels[food.role] || "立ち寄り")}</span>
          <span class="food-break-route-part">${escapeHtml(foodRoutePartLabels[food.routePart] || "区間情報なし")}</span>
          ${status ? `<span class="food-break-status">${escapeHtml(status)}</span>` : ""}
        </div>
        <h4 id="food-break-${escapeHtml(food.id)}">${escapeHtml(food.name)}</h4>
        <p class="food-break-category">${escapeHtml(food.category || "ジャンル情報なし")}</p>
        <p class="food-break-location"><strong>コース${escapeHtml(food.nearStopOrder)}番・${escapeHtml(food.nearStopName)}付近</strong><span>${escapeHtml(food.locationNote || "位置補足は情報なし")}</span></p>
        <p class="food-break-editorial">${escapeHtml(food.editorialNote || "公式情報を確認できる立ち寄り候補です。")}</p>
        ${mapUrl ? `<a class="btn btn--accent food-break-map-link" href="${mapUrl}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(food.name)}をGoogleマップで開く（外部サイト）"${trackingAttributes("map", { linkType: "food", contentId: food.id, areaId, courseId: food.courseId, stopOrder: food.nearStopOrder })}${trackingAttributes("food", { foodId: food.id, courseId: food.courseId, areaId, linkType: "map" })}>Googleマップで開く <span aria-hidden="true">↗</span></a>` : ""}
        <dl class="food-break-facts">
          <div><dt>利用時間帯</dt><dd>${escapeHtml(periods.length ? periods.join("・") : "情報なし")}</dd></div>
          <div><dt>予算</dt><dd>${escapeHtml(food.priceLabel || "公式メニューをご確認ください")}</dd></div>
        </dl>
        <div class="food-break-services" aria-label="${escapeHtml(food.name)}のサービス情報">
          ${serviceFacts.map(([label, value]) => `<span>${escapeHtml(label)}：${escapeHtml(foodServiceValueLabel(value))}</span>`).join("")}
        </div>
        <div class="food-break-links">
          ${officialUrl ? `<a href="${officialUrl}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(food.name)}の公式サイトを開く（外部サイト）"${trackingAttributes("food", { foodId: food.id, courseId: food.courseId, areaId, linkType: "official" })}${trackingAttributes("official", { contentType: "food", contentId: food.id, linkType: "official", areaId })}>公式サイト <span aria-hidden="true">↗</span></a>` : ""}
          ${menuUrl ? `<a href="${menuUrl}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(food.name)}の公式メニューを開く（外部サイト）"${trackingAttributes("food", { foodId: food.id, courseId: food.courseId, areaId, linkType: "menu" })}${trackingAttributes("official", { contentType: "food", contentId: food.id, linkType: "menu", areaId })}>公式メニュー <span aria-hidden="true">↗</span></a>` : ""}
          ${reservationUrl ? `<a href="${reservationUrl}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(food.name)}の公式予約案内を開く（外部サイト）"${trackingAttributes("food", { foodId: food.id, courseId: food.courseId, areaId, linkType: "reservation" })}${trackingAttributes("official", { contentType: "food", contentId: food.id, linkType: "reservation", areaId })}>公式予約 <span aria-hidden="true">↗</span></a>` : ""}
          ${tabelogUrl ? `<a class="food-break-tabelog-link" href="${tabelogUrl}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(food.name)}を食べログで確認する（外部サイト）"${trackingAttributes("food", { foodId: food.id, courseId: food.courseId, areaId, linkType: "tabelog" })}>食べログで確認 <span aria-hidden="true">↗</span></a>` : ""}
        </div>
        <div class="food-break-meta">
          <span>情報確認日：${escapeHtml(practicalInfoDate(food.informationCheckedAt))}</span>
          <span>${food.fieldResearch === false ? "現地取材・実食確認なし" : "現地確認あり"}</span>
          <span>${food.isSponsored === true ? "広告掲載" : "広告ではありません"}</span>
        </div>
      </article>
    </li>`;
  }

  function coursePracticalInfo(course) {
    const transitAccess = Array.isArray(DATA.transitAccess)
      ? DATA.transitAccess.filter((access) => access.courseId === course.id).sort((a, b) => (a.role === "arrival" ? -1 : 1) - (b.role === "arrival" ? -1 : 1))
      : [];
    const toilets = Array.isArray(DATA.toilets) ? DATA.toilets.filter((toilet) => toilet.courseId === course.id) : [];
    const foodBreaks = Array.isArray(DATA.foodBreaks) ? DATA.foodBreaks.filter((food) => food.courseId === course.id) : [];
    const transitCards = transitAccess.length
      ? `<div class="transit-grid">${transitAccess.map(transitCard).join("")}</div>`
      : `<p class="empty-state">公式の駅・電車情報を確認中です。</p>`;
    const toiletList = toilets.length
      ? `<ul class="toilet-grid">${toilets.map(toiletCard).join("")}</ul>`
      : `<p class="empty-state">公式情報からコース付近のトイレを確認できませんでした。Googleマップや現地の案内をご確認ください。</p>`;
    const foodBreakList = foodBreaks.length >= 2
      ? `<ul class="food-break-grid">${foodBreaks.map(foodBreakCard).join("")}</ul>`
      : `<p class="empty-state">公式情報を確認できる食事・休憩候補を準備中です。周辺の店舗はGoogleマップ等でもご確認ください。</p>`;
    return `<section class="section practical-info-section" aria-labelledby="practical-info-${escapeHtml(course.id)}"><div class="container">
      <div class="practical-info-heading">
        <span class="eyebrow">PRACTICAL INFO</span>
        <h2 id="practical-info-${escapeHtml(course.id)}">おでかけ実用情報</h2>
      </div>
      <nav class="practical-info-jump" aria-label="おでかけ実用情報内の移動">
        <span>見たい情報へ</span>
        <div>
          <button type="button" data-practical-jump="transit-info-${escapeHtml(course.id)}">電車・駅</button>
          <button type="button" data-practical-jump="food-info-${escapeHtml(course.id)}">食事・休憩</button>
          <button type="button" data-practical-jump="toilet-info-${escapeHtml(course.id)}">トイレ</button>
        </div>
      </nav>
      <section class="practical-info-group transit-info" id="transit-info-${escapeHtml(course.id)}" aria-labelledby="transit-heading-${escapeHtml(course.id)}">
        <div class="practical-info-heading">
          <h3 id="transit-heading-${escapeHtml(course.id)}" tabindex="-1">電車・駅情報</h3>
          <p>散歩のSTARTへ向かう駅と、GOALから利用しやすい駅を公式情報と結び付けています。</p>
        </div>
        ${transitCards}
        <div class="transit-notes">
          <p>時刻表、運行状況、出口、駅設備は変更される場合があります。利用前に鉄道会社の公式情報をご確認ください。</p>
          <p>遅延・運休などは鉄道会社の公式運行情報でご確認ください。</p>
          <p>設備の停止・点検が行われる場合があります。利用前に鉄道会社の公式情報をご確認ください。</p>
          <p>公開されている鉄道会社・地図情報をもとに掲載しています。現地での駅動線確認は行っていません。</p>
        </div>
      </section>
      <section class="practical-info-group food-break-info" id="food-info-${escapeHtml(course.id)}" aria-labelledby="food-heading-${escapeHtml(course.id)}">
        <div class="practical-info-heading">
          <h3 id="food-heading-${escapeHtml(course.id)}" tabindex="-1">食事・カフェ・休憩情報</h3>
          <p>散歩の流れと利用目的に合わせ、公式情報を確認できる立ち寄り候補を掲載しています。</p>
        </div>
        ${foodBreakList}
        <div class="practical-info-notice">
          <p>営業時間、定休日、メニュー、価格、予約方法は変更される場合があります。来店前に店舗の公式情報をご確認ください。</p>
          <p>掲載内容は公開情報をもとに作成しており、現地取材・実食確認は行っていません。</p>
        </div>
      </section>
      <section class="practical-info-group toilet-info" id="toilet-info-${escapeHtml(course.id)}" aria-labelledby="toilet-heading-${escapeHtml(course.id)}">
        <div class="practical-info-heading">
          <h3 id="toilet-heading-${escapeHtml(course.id)}" tabindex="-1">トイレ情報</h3>
          <p>公開されている自治体・施設情報をもとに、コース付近で利用しやすいトイレを掲載しています。</p>
        </div>
        ${toiletList}
        <p class="practical-info-notice">利用時間、設備、工事状況は変更される場合があります。現地の案内と公式情報をご確認ください。</p>
      </section>
    </div></section>`;
  }

  function coursePage(id) {
    const course = DATA.courses.find((c) => c.id === id);
    if (!course) return notFound();
    const area = DATA.areas.find((a) => a.id === course.areaId);
    return `${header()}<main id="main"><section class="article-header"><div class="narrow">${breadcrumbs([{ href: "#/", label: "トップ" }, { href: "#/courses", label: "コース" }, { label: course.title }])}<span class="eyebrow">${area.name}・モデルコース</span><h1>${course.title}</h1>${favoriteButton("course", course.id, course.title, true)}<p class="article-lead">${course.summary}</p><div class="card-meta"><span class="pill">${course.distance}</span><span class="pill">${course.duration}</span><span class="pill">${course.budget}</span><span class="pill">${course.audience}</span></div><div class="article-cover article-cover--course">${imageMarkup(course.image, courseImageAlt(course, `${course.title}を表現した参考イメージ`), "")}</div>${trustPanel(course, area.officialSources)}</div></section>
    <section class="section section--compact"><div class="container map-layout"><div class="map-shell"><iframe loading="lazy" src="${mapsEmbedUrl(area.mapQuery)}" title="${escapeHtml(course.title)}の地図"></iframe></div><div><h2>立ち寄り地点</h2>${courseRouteStopList(course)}${courseRouteGuide(course, area)}</div></div></section>
    ${coursePracticalInfo(course)}
    <section class="section section--soft"><div class="narrow article-body"><h2>この順番で歩く理由</h2><p>駅の近くから始め、街の特徴が切り替わる方向へ進むことで、同じ道を戻らずに歩ける構成です。営業状況や工事、混雑により変わるため、来訪前に公式情報とGoogleマップをご確認ください。</p><div class="article-note">距離と徒歩時間は地図情報をもとにした概算です。信号待ち、休憩、立ち寄り時間は含まれない場合があります。</div></div></section></main>${footer()}`;
  }

  function storyPage(id) {
    const story = DATA.stories.find((s) => s.id === id);
    if (!story) return notFound();
    const area = DATA.areas.find((a) => a.id === story.areaId);
    const related = DATA.spots.filter((s) => s.areaId === story.areaId).slice(0, 3);
    return `${header()}<main id="main"><article><header class="article-header"><div class="narrow">${breadcrumbs([{ href: "#/", label: "トップ" }, { href: "#/stories", label: "読み物" }, { label: story.title }])}<span class="eyebrow">${story.category}・${story.readTime}</span><h1>${story.title}</h1>${favoriteButton("story", story.id, story.title, true)}<p class="article-lead">${story.excerpt}</p><div class="article-cover article-cover--spot">${imageMarkup(story.image, storyImageAlt(story, `${story.title}を表現した参考イメージ`), "")}</div>${trustPanel(story, area.officialSources)}</div></header><div class="narrow article-body"><p>${story.intro}</p>${story.sections.map((s) => `<h2>${escapeHtml(s.heading)}</h2><p>${escapeHtml(s.body)}</p>`).join("")}<p><a class="btn btn--dark" href="#/area/${area.id}">${area.name}のエリアガイドへ</a></p></div></article><section class="section section--soft"><div class="container"><div class="section-heading"><div><span class="eyebrow">RELATED</span><h2>関連スポット</h2></div></div><div class="grid grid--3">${related.map(spotCard).join("")}</div></div></section></main>${footer()}`;
  }

  function spotPage(id) {
    const spot = DATA.spots.find((s) => s.id === id);
    if (!spot) return notFound();
    const area = DATA.areas.find((a) => a.id === spot.areaId);
    const officialUrl = safeExternalUrl(spot.officialUrl);
    const coverClass = spotImageKeys.has(spot.image) ? "article-cover article-cover--spot" : "article-cover";
    return `${header()}<main id="main"><section class="article-header"><div class="narrow">${breadcrumbs([{ href: "#/", label: "トップ" }, { href: "#/spots", label: "スポット" }, { label: spot.name }])}<span class="eyebrow">${spot.category}・${area.name}</span><h1>${spot.name}</h1>${favoriteButton("spot", spot.id, spot.name, true)}<p class="article-lead">${spot.excerpt}</p><div class="${coverClass}">${imageMarkup(spot.image, spotImageAlt(spot), "")}</div>${trustPanel(spot, officialUrl ? [{ label: spot.name, url: officialUrl }] : [])}</div></section><section class="section section--compact"><div class="container map-layout"><div class="map-shell"><iframe loading="lazy" src="${mapsEmbedUrl(spot.mapQuery)}" title="${escapeHtml(spot.name)}のGoogleマップ"></iframe></div><div class="contact-panel"><h2>行く前に確認</h2><p>営業時間、休館日、料金などは変更される場合があります。訪問前に公式情報をご確認ください。</p>${officialUrl ? `<p><a class="btn btn--accent" href="${officialUrl}" target="_blank" rel="noopener noreferrer"${trackingAttributes("official", { contentType: "spot", contentId: spot.id, linkType: "official", areaId: area.id })}>公式情報</a></p>` : "<p>公式URLは未登録です。</p>"}<p><a class="btn" href="${mapsPlaceUrl(spot.mapQuery)}" target="_blank" rel="noopener noreferrer"${trackingAttributes("map", { linkType: "spot", contentId: spot.id, areaId: area.id })}>Googleマップで開く</a></p><p><a class="text-link" href="#/area/${area.id}">${area.name}のガイドへ →</a></p></div></div></section></main>${footer()}`;
  }

  function mapPage(areaId) {
    const selectedArea = DATA.areas.find((a) => a.id === areaId) || DATA.areas[0];
    const course = DATA.courses.find((c) => c.areaId === selectedArea.id);
    return `${header()}<main id="main"><section class="page-hero"><div class="container">${breadcrumbs([{ href: "#/", label: "トップ" }, { label: "お散歩マップ" }])}<span class="eyebrow">GOOGLE MAPS</span><h1>お散歩マップ</h1><p>実用地図はGoogleマップを使用します。地点番号と記事の順番を合わせ、外部地図では前半と後半に分けた徒歩ルートを開けます。</p><div class="card-meta">${DATA.areas.map((area) => `<a class="pill ${area.id === selectedArea.id ? "pill--accent" : ""}" href="#/map/${area.id}">${area.name}</a>`).join("")}</div></div></section><section class="section section--compact"><div class="container map-layout"><div class="map-shell"><iframe loading="lazy" src="${mapsEmbedUrl(selectedArea.mapQuery)}" title="${selectedArea.name}のお散歩マップ"></iframe></div><div><span class="eyebrow">${selectedArea.name}</span><h2>${course.title}</h2><p>${course.summary}</p>${courseRouteStopList(course)}${courseRouteGuide(course, selectedArea)}</div></div></section></main>${footer()}`;
  }

  function eventsPage() {
    const currentEvents = DATA.events.filter((event) => eventState(event) !== "終了").sort((a, b) => new Date(a.start) - new Date(b.start));
    const pastEvents = DATA.events.filter((event) => eventState(event) === "終了").sort((a, b) => new Date(b.end) - new Date(a.end));
    return `${header()}<main id="main"><section class="page-hero"><div class="container">${breadcrumbs([{ href: "#/", label: "トップ" }, { label: "イベント" }])}<span class="eyebrow">EVENTS</span><h1>掲載イベント情報</h1><p>イベントは手動更新です。終了日時による状態判定のみ自動で行い、新規掲載、中止、延期、公式情報の確認は手動で管理します。</p></div></section><section class="section section--compact"><div class="container"><h2>現在・今後のイベント</h2>${currentEvents.length ? `<div class="event-list">${currentEvents.map((event) => eventCard(event, true)).join("")}</div>` : `<div class="empty-state"><h3>現在、確認済みのイベント情報はありません</h3><p>新しい情報を確認後に掲載します。</p></div>`}${pastEvents.length ? `<h2 style="margin-top:48px">過去のイベント</h2><div class="event-list">${pastEvents.map((event) => eventCard(event, true)).join("")}</div>` : ""}</div></section></main>${footer()}`;
  }

  function aboutPage() {
    return `${header()}<main id="main"><section class="page-hero"><div class="narrow">${breadcrumbs([{ href: "#/", label: "トップ" }, { label: "はじめての方" }])}<span class="eyebrow">ABOUT</span><h1>おさんぽクラブ東京について</h1><p>公式情報、自治体、施設、地図情報などを参考に、東京の街歩きプランを編集しています。</p></div></section><section class="section section--compact"><div class="narrow article-body"><h2>現在の公開範囲</h2><p>${escapeHtml(SITE_INFO.expansionMessage)} 現在は高円寺・吉祥寺・浅草の基本ガイドを公開し、その他のエリアは記事準備中です。</p><h2>来訪前の確認</h2><p>営業時間、定休日、料金、イベント内容は変更される場合があります。訪問前に必ず公式情報をご確認ください。</p><p><a class="btn btn--accent" href="#/editorial-policy">編集方針を読む</a> <a class="btn" href="#/areas">エリア一覧へ</a></p></div></section></main>${footer()}`;
  }

  function operationPage() {
    const contactState = configuredEmail || configuredFormUrl ? "公開中の受付方法は、お問い合わせページで案内しています。" : "現在、公開用の問い合わせ先を準備中です。受付開始後はお問い合わせページで案内します。";
    return `${header()}<main id="main"><section class="page-hero"><div class="narrow">${breadcrumbs([{ href: "#/", label: "トップ" }, { label: "運営情報" }])}<span class="eyebrow">OPERATION</span><h1>運営情報</h1><p>おさんぽクラブ東京編集部が、公開情報をもとに運営しています。</p></div></section><section class="section section--compact"><div class="narrow article-body"><h2>運営方針</h2><p>現地取材の有無と公開情報による作成を区別し、未確認の営業時間、料金、イベント日時を断定しません。</p><h2>連絡先</h2><p>${contactState}</p><p><a class="btn" href="#/contact">お問い合わせ</a> <a class="btn" href="#/">トップへ戻る</a></p></div></section></main>${footer()}`;
  }

  function policyPage() {
    return `${header()}<main id="main"><section class="page-hero"><div class="narrow">${breadcrumbs([{ href: "#/", label: "トップ" }, { label: "編集方針" }])}<span class="eyebrow">EDITORIAL POLICY</span><h1>編集方針</h1><p>確認できた事実と、編集上の提案・イメージを区別します。</p></div></section><section class="section section--compact"><div class="narrow article-body"><h2>情報の作成方法</h2><p>記事、エリア、コースは公開情報をもとに作成しています。現地取材は未実施で、現地の歩きやすさ、休憩候補、最新状況は今後確認予定です。</p><h2>AI利用</h2><p>文章の構成や表現の補助にAIを利用しています。未確認情報を事実として追加しない方針です。</p><h2>画像について</h2><p>${imageDisclosure}</p><p>掲載画像はローカルファイルとして管理し、実在店舗の外観や施設、イベントの開催記録写真として扱いません。</p><h2>更新情報</h2><p>最終更新日：${escapeHtml(SITE_INFO.lastUpdated || "未記録")}。営業時間、料金、イベント内容は変更される可能性があるため、訪問前に公式情報をご確認ください。</p></div></section></main>${footer()}`;
  }

  function privacyPage() {
    const contactPrivacy = configuredEmail || configuredFormUrl ? "お問い合わせ時に入力した情報は、利用者が選択したメールまたは外部フォームの提供元へ送信されます。" : "現在、問い合わせフォームと送信先は未設定で、サイト上で個人情報を送信する機能は表示していません。";
    const analyticsPrivacy = ANALYTICS.isEnabled()
      ? `<h2>アクセス解析</h2><p>サイト改善と利用状況の把握を目的としてGoogle Analytics 4を利用しています。Cookie等が利用される場合があります。氏名やメールアドレスを解析イベントとして送信せず、検索語の生データも送信しない設計です。Google側の情報の取り扱いは、Googleの規約とプライバシーポリシーをご確認ください。</p>`
      : `<h2>アクセス解析</h2><p>現在、アクセス解析は無効で、Google Analytics 4の解析通信は行っていません。</p>`;
    return `${header()}<main id="main"><section class="page-hero"><div class="narrow">${breadcrumbs([{ href: "#/", label: "トップ" }, { label: "プライバシーポリシー" }])}<span class="eyebrow">PRIVACY</span><h1>プライバシーポリシー</h1><p>現在のサイト実装に合わせた情報の取り扱いを説明します。</p></div></section><section class="section section--compact"><div class="narrow article-body">${analyticsPrivacy}<h2>取得していない情報</h2><p>このサイトには会員登録、決済、ブラウザの位置情報取得機能はありません。</p><h2>お気に入り情報</h2><p>お気に入り情報は利用者のブラウザ内に保存され、サーバーへ送信されません。アカウント間や端末間では同期されず、ブラウザのサイトデータを削除すると消去されます。</p><h2>外部サービス</h2><p>Googleマップの埋め込みや公式情報などの外部リンクを利用した際、各サービスへ通信が発生します。掲載画像はサイト内のローカルファイルです。外部サービス側の情報取り扱いは、それぞれの規約とプライバシーポリシーをご確認ください。</p><h2>お問い合わせ</h2><p>${contactPrivacy}</p><p><a class="btn" href="#/">トップへ戻る</a></p></div></section></main>${footer()}`;
  }

  function advertisingPage() {
    const contactAction = configuredEmail || configuredFormUrl
      ? `<a class="btn btn--accent" href="#/contact">広告掲載について相談する</a>`
      : `<a class="btn" href="#/contact">お問い合わせ状況を確認</a>`;
    return `${header()}<main id="main"><section class="page-hero"><div class="narrow">${breadcrumbs([{ href: "#/", label: "トップ" }, { label: "広告掲載" }])}<span class="eyebrow">PARTNERS</span><h1>広告掲載・地域パートナー</h1><p>現在、正式な掲載プランと受付方法を準備しています。</p></div></section><section class="section section--compact"><div class="narrow article-body"><div class="article-note">地域パートナー募集予定／テスト掲載の相談受付準備中／媒体資料準備中／アクセス実績を蓄積中です。</div><p>架空のアクセス数、掲載実績、固定料金は表示していません。広告を掲載する場合は「PR」と明示し、編集記事と区別します。</p><p>受付開始後は、このページとお問い合わせページで案内します。</p><p>${contactAction} <a class="btn" href="#/">トップへ戻る</a></p></div></section></main>${footer()}`;
  }

  function contactPage() {
    const methods = [];
    if (configuredFormUrl) methods.push(`<a class="btn btn--accent" href="${configuredFormUrl}" target="_blank" rel="noopener noreferrer"${trackingAttributes("contact", { method: "form", sourcePage: "contact" })}>お問い合わせフォームを開く</a>`);
    if (configuredEmail) methods.push(`<a class="btn btn--accent" href="mailto:${encodeURIComponent(configuredEmail)}"${trackingAttributes("contact", { method: "email", sourcePage: "contact" })}>メールで問い合わせる</a>`);
    const contactBody = methods.length
      ? `<div class="contact-panel"><h2>受付方法</h2><div class="form-actions">${methods.join("")}</div><p>外部サービスまたはメールアプリが開きます。送信前に宛先をご確認ください。</p></div>`
      : `<div class="contact-panel"><h2>現在、お問い合わせ受付を準備中です</h2><p>公開用メールアドレスまたは外部フォームが未設定のため、送信フォームと送信ボタンは表示していません。</p><p>受付開始後は、このページで案内します。</p></div>`;
    return `${header()}<main id="main"><section class="page-hero"><div class="container">${breadcrumbs([{ href: "#/", label: "トップ" }, { label: "お問い合わせ" }])}<span class="eyebrow">CONTACT</span><h1>情報訂正・お問い合わせ</h1><p>${methods.length ? "公開中の受付方法をご利用ください。" : "現在、お問い合わせ受付を準備中です。"}</p></div></section><section class="section section--compact"><div class="container">${contactBody}<div class="empty-actions"><a class="btn" href="#/">トップへ戻る</a><a class="btn" href="#/operation">運営情報</a><a class="btn" href="#/advertise">広告掲載</a></div></div></section></main>${footer()}`;
  }

  const searchMatchCount = (keywordValue, areaId) => {
    const keyword = String(keywordValue || "").toLowerCase();
    return [
      ...DATA.areas.filter((area) => (!areaId || area.id === areaId) && (!keyword || `${area.name} ${area.lead} ${area.tags.join(" ")}`.toLowerCase().includes(keyword))),
      ...DATA.courses.filter((course) => (!areaId || course.areaId === areaId) && (!keyword || `${course.title} ${course.summary}`.toLowerCase().includes(keyword))),
      ...DATA.spots.filter((spot) => (!areaId || spot.areaId === areaId) && (!keyword || `${spot.name} ${spot.excerpt} ${spot.category}`.toLowerCase().includes(keyword))),
      ...DATA.stories.filter((story) => (!areaId || story.areaId === areaId) && (!keyword || `${story.title} ${story.excerpt}`.toLowerCase().includes(keyword))),
    ].length;
  };

  function searchResults() {
    const params = new URLSearchParams(location.hash.split("?")[1] || "");
    const keyword = (params.get("keyword") || "").toLowerCase();
    const areaId = params.get("area") || "";
    const cards = [];
    DATA.areas.filter((a) => (!areaId || a.id === areaId) && (!keyword || `${a.name} ${a.lead} ${a.tags.join(" ")}`.toLowerCase().includes(keyword))).forEach((a) => cards.push(areaCard(a)));
    DATA.courses.filter((c) => (!areaId || c.areaId === areaId) && (!keyword || `${c.title} ${c.summary}`.toLowerCase().includes(keyword))).forEach((c) => cards.push(courseCard(c)));
    DATA.spots.filter((s) => (!areaId || s.areaId === areaId) && (!keyword || `${s.name} ${s.excerpt} ${s.category}`.toLowerCase().includes(keyword))).forEach((s) => cards.push(spotCard(s)));
    DATA.stories.filter((s) => (!areaId || s.areaId === areaId) && (!keyword || `${s.title} ${s.excerpt}`.toLowerCase().includes(keyword))).forEach((s) => cards.push(storyCard(s)));
    const criteria = [params.get("keyword") ? `キーワード：${params.get("keyword")}` : "", areaId ? `エリア：${DATA.areas.find((area) => area.id === areaId)?.name || areaId}` : ""].filter(Boolean).join("／") || "すべて";
    const emptyState = `<div class="empty-state"><h2>条件に合う内容がありませんでした</h2><p>条件を解除するか、公開中のエリアから探してください。</p><div class="empty-actions"><a class="btn btn--accent" href="#/search">条件をすべて解除する</a><a class="btn" href="#/areas">エリア一覧へ戻る</a></div></div><div class="section-heading" style="margin-top:40px"><div><span class="eyebrow">SUGGESTIONS</span><h2>公開中のエリア</h2></div></div><div class="grid grid--3">${DATA.areas.map(areaCard).join("")}</div>`;
    return `${header()}<main id="main"><section class="page-hero"><div class="container">${breadcrumbs([{ href: "#/", label: "トップ" }, { label: "検索結果" }])}<span class="eyebrow">SEARCH</span><h1>検索結果</h1><p>${escapeHtml(criteria)}：${cards.length}件</p></div></section><section class="section section--compact"><div class="container">${cards.length ? `<div class="grid grid--3">${cards.join("")}</div>` : emptyState}</div></section></main>${footer()}`;
  }

  function notFound() {
    return `${header()}<main id="main"><section class="page-hero"><div class="narrow"><span class="eyebrow">404</span><h1>ページが見つかりません</h1><p>URLをご確認いただくか、トップまたはエリア一覧からお探しください。</p><div class="empty-actions"><a class="btn btn--accent" href="#/">トップへ戻る</a><a class="btn" href="#/areas">エリア一覧へ戻る</a></div></div></section></main>${footer()}`;
  }

  const plainText = (value = "") => String(value).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  const shortDescription = (value) => plainText(value).slice(0, 155);
  const safeAnalyticsHash = () => {
    const [path = "#/", query = ""] = location.hash.split("?");
    if (!query) return path || "#/";
    const params = new URLSearchParams(query);
    params.delete("keyword");
    const safeQuery = params.toString();
    return `${path || "#/"}${safeQuery ? `?${safeQuery}` : ""}`;
  };
  const analyticsPageLocation = (safeHash) => {
    if (configuredSiteUrl) {
      const url = new URL(configuredSiteUrl);
      url.hash = safeHash;
      return url.href;
    }
    return `${location.origin}${location.pathname}${safeHash}`;
  };
  const pageInformation = () => {
    const [type = "", id = ""] = routeParts();
    const siteName = CONFIG.siteName || "おさんぽクラブ東京";
    const details = {
      areas: ["エリアから探す", "高円寺・吉祥寺・浅草の街歩きエリアを、雰囲気や目的から探せます。", "areas"],
      courses: ["おさんぽコース", "東京の街歩きコースを、所要時間・予算・気分・歩く相手から絞り込めます。", "courses"],
      spots: ["スポット紹介", "東京の散歩に組み込みやすい商店街、公園、神社、文化施設を紹介します。", "spots"],
      stories: ["街の読み物", "高円寺・吉祥寺・浅草を歩く理由と楽しみ方を紹介する街の読み物です。", "stories"],
      events: ["掲載イベント情報", "東京の街歩きと合わせて確認できるイベント情報を、公式情報の確認状態とともに掲載します。", "events"],
      map: ["お散歩マップ", "高円寺・吉祥寺・浅草の散歩コースと立ち寄り地点をGoogleマップで確認できます。", "map"],
      favorites: ["お気に入り", "ブラウザに保存したエリア、コース、スポット、街の読み物をまとめて確認できます。", "favorites"],
      search: ["検索結果", "公開中のエリア、コース、スポット、街の読み物から条件に合う内容を表示します。", "search"],
      about: ["おさんぽクラブ東京について", "公式情報をもとに東京の街歩きプランを編集する、おさんぽクラブ東京の案内です。", "about"],
      operation: ["運営情報", "おさんぽクラブ東京の運営方針と問い合わせ受付状況を案内します。", "operation"],
      "editorial-policy": ["編集方針", "事実と編集上の提案を区別する、おさんぽクラブ東京の編集方針です。", "editorial_policy"],
      policy: ["編集方針", "事実と編集上の提案を区別する、おさんぽクラブ東京の編集方針です。", "editorial_policy"],
      privacy: ["プライバシーポリシー", "おさんぽクラブ東京におけるアクセス解析、お気に入り、外部サービス、問い合わせ情報の取り扱いを説明します。", "privacy"],
      advertise: ["広告掲載・地域パートナー", "おさんぽクラブ東京の広告掲載と地域パートナー募集の準備状況を案内します。", "advertise"],
      advertising: ["広告掲載・地域パートナー", "おさんぽクラブ東京の広告掲載と地域パートナー募集の準備状況を案内します。", "advertise"],
      contact: ["情報訂正・お問い合わせ", "おさんぽクラブ東京への情報訂正と問い合わせの受付状況を案内します。", "contact"],
    };
    let title = siteName;
    let description = "東京の街を、気分・時間・予算から探せる街歩きメディア。実在スポット、イベント、散歩コースをGoogleマップと一緒に紹介します。";
    let routeName = "home";
    let content = null;

    if (type === "area") {
      content = DATA.areas.find((area) => area.id === id);
      if (content) [title, description, routeName] = [content.name, `${content.name}の街歩きガイド。${content.lead || content.description}`, "area_detail"];
    } else if (type === "course") {
      content = DATA.courses.find((course) => course.id === id);
      if (content) [title, description, routeName] = [content.title, `${content.title}。${content.summary}`, "course_detail"];
    } else if (type === "spot") {
      content = DATA.spots.find((spot) => spot.id === id);
      if (content) [title, description, routeName] = [content.name, `${content.name}。${content.excerpt}`, "spot_detail"];
    } else if (type === "story") {
      content = DATA.stories.find((story) => story.id === id);
      if (content) [title, description, routeName] = [content.title, `${content.title}。${content.excerpt}`, "story_detail"];
    } else if (details[type]) {
      [title, description, routeName] = details[type];
    } else if (type) {
      title = "ページが見つかりません";
      description = "指定されたページは見つかりませんでした。トップまたはエリア一覧からお探しください。";
      routeName = "not_found";
    }
    if (["area", "course", "spot", "story"].includes(type) && !content) {
      title = "ページが見つかりません";
      description = "指定されたページは見つかりませんでした。トップまたはエリア一覧からお探しください。";
      routeName = "not_found";
    }

    const safeHash = safeAnalyticsHash();
    const pageTitle = title === siteName ? siteName : `${plainText(title)} | ${siteName}`;
    return {
      type,
      id,
      content,
      title: pageTitle,
      description: shortDescription(description),
      routeName,
      safeHash,
      pageLocation: analyticsPageLocation(safeHash),
    };
  };
  const setMetaContent = (selector, value) => {
    const element = document.head.querySelector(selector);
    if (element) element.setAttribute("content", value);
  };
  const setRobotsDirective = (value) => {
    let element = document.head.querySelector('meta[name="robots"]');
    if (!element) {
      element = document.createElement("meta");
      element.setAttribute("name", "robots");
      document.head.appendChild(element);
    }
    element.setAttribute("content", value);
  };
  const updateDocumentMetadata = () => {
    const info = pageInformation();
    document.title = info.title;
    setMetaContent('meta[name="description"]', info.description);
    setMetaContent('meta[property="og:title"]', info.title);
    setMetaContent('meta[property="og:description"]', info.description);
    setMetaContent('meta[property="og:url"]', configuredSiteUrl ? info.pageLocation : "");
    setMetaContent('meta[name="twitter:title"]', info.title);
    setMetaContent('meta[name="twitter:description"]', info.description);
    setRobotsDirective(["favorites", "search"].includes(info.type) || info.routeName === "not_found" ? "noindex,follow" : "index,follow");
    return info;
  };
  const trackRenderedPage = (info) => {
    const sent = ANALYTICS.trackPageView({
      pageKey: info.safeHash,
      pageTitle: info.title,
      pageLocation: info.pageLocation,
      routeName: info.routeName,
    });
    if (!sent) return;
    const eventNames = {
      area: "area_view",
      course: "course_view",
      spot: "spot_view",
      story: "story_view",
      advertise: "advertise_view",
      advertising: "advertise_view",
      contact: "contact_view",
    };
    const eventName = eventNames[info.type];
    if (!eventName) return;
    const areaId = info.type === "area"
      ? info.content?.id
      : info.content?.areaId;
    trackEvent(eventName, {
      content_id: info.content?.id,
      content_type: info.type === "advertising" ? "advertise" : info.type,
      area_id: areaId,
      route_name: info.routeName,
    });
  };
  const courseFilterEventParameters = (filters, extra = {}) => ({
    selected_filter_count: Object.values(filters).filter(Boolean).length,
    area_id: filters.area,
    duration: filters.duration,
    budget: filters.budget,
    audience: filters.audience,
    mood: filters.mood,
    has_keyword: Boolean(filters.keyword),
    ...extra,
  });
  const trackingParameters = (element, group) => {
    const prefix = `track${group.charAt(0).toUpperCase()}${group.slice(1)}`;
    return Object.fromEntries(Object.entries(element.dataset)
      .filter(([key]) => key.startsWith(prefix) && key !== prefix)
      .map(([key, value]) => {
        const suffix = key.slice(prefix.length);
        const parameter = suffix.charAt(0).toLowerCase() + suffix.slice(1);
        return [parameter.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`), value];
      }));
  };

  function render() {
    const [type, id] = routeParts();
    let html;
    if (!type) html = homePage();
    else if (["areas", "courses", "spots", "stories"].includes(type)) html = listPage(type);
    else if (type === "area") html = areaPage(id);
    else if (type === "course") html = coursePage(id);
    else if (type === "story") html = storyPage(id);
    else if (type === "spot") html = spotPage(id);
    else if (type === "map") html = mapPage(id);
    else if (type === "events") html = eventsPage();
    else if (type === "favorites") html = favoritesPage();
    else if (type === "about") html = aboutPage();
    else if (type === "operation") html = operationPage();
    else if (type === "editorial-policy" || type === "policy") html = policyPage();
    else if (type === "privacy") html = privacyPage();
    else if (type === "advertise" || type === "advertising") html = advertisingPage();
    else if (type === "contact") html = contactPage();
    else if (type === "search") html = searchResults();
    else html = notFound();
    app.innerHTML = rewritePublicLinks(html);
    const pageInfo = updateDocumentMetadata();
    bindInteractions();
    window.scrollTo({ top: 0, behavior: "instant" });
    window.__OSANPO_APP_READY__ = true;
    trackRenderedPage(pageInfo);
  }

  function bindInteractions() {
    const toggle = document.querySelector(".nav-toggle");
    const nav = document.querySelector(".site-nav");
    toggle?.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(isOpen));
      toggle.setAttribute("aria-label", isOpen ? "メニューを閉じる" : "メニューを開く");
    });

    document.getElementById("heroSearch")?.addEventListener("submit", (event) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      const params = new URLSearchParams();
      const keyword = String(form.get("keyword") || "").trim();
      const areaId = String(form.get("area") || "");
      if (keyword) params.set("keyword", keyword);
      if (areaId) params.set("area", areaId);
      trackEvent("search_submit", {
        has_keyword: Boolean(keyword),
        area_id: areaId,
        result_count: searchMatchCount(keyword, areaId),
      });
      location.hash = `#/search?${params.toString()}`;
    });

    document.getElementById("courseFilters")?.addEventListener("submit", (event) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      const filters = {};
      courseFilterOrder.forEach((key) => {
        const value = String(form.get(key) || "").trim();
        if (value) filters[key] = value;
      });
      trackEvent("course_filter_apply", courseFilterEventParameters(filters));
      location.hash = courseFiltersToHash(filters);
    });

    document.querySelectorAll("[data-course-filter-remove]").forEach((button) => {
      button.addEventListener("click", () => {
        const filters = readCourseFilters();
        const removedFilter = button.dataset.courseFilterRemove;
        delete filters[removedFilter];
        trackEvent("course_filter_remove", courseFilterEventParameters(filters, { removed_filter: removedFilter }));
        location.hash = courseFiltersToHash(filters);
      });
    });

    document.querySelectorAll("[data-course-filter-clear]").forEach((link) => {
      link.addEventListener("click", () => {
        const filters = readCourseFilters();
        trackEvent("course_filter_clear", courseFilterEventParameters({}, {
          removed_filter: Object.keys(filters).filter((key) => filters[key]).join(","),
        }));
      });
    });

    document.querySelectorAll("[data-practical-jump]").forEach((button) => {
      button.addEventListener("click", () => {
        const section = document.getElementById(button.dataset.practicalJump || "");
        if (!section) return;
        section.scrollIntoView({ behavior: "smooth", block: "start" });
        const heading = section.querySelector("h3");
        if (heading) heading.focus({ preventScroll: true });
      });
    });

    document.querySelectorAll(".favorite-toggle").forEach((button) => {
      button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        const { favoriteType: type, favoriteId: id } = button.dataset;
        const favorite = favoriteRecord(favoriteKey(type, id));
        if (!favorite) return;
        const active = toggleFavorite(type, id);
        if (routeParts()[0] === "favorites") {
          render();
        } else {
          updateFavoriteButtons(type, id);
          updateFavoriteCount();
        }
        trackEvent("favorite_change", {
          content_type: type,
          content_id: id,
          action: active ? "add" : "remove",
        });
        announceFavoriteChange(favoriteLabel(type, favorite.record), active);
      });
    });
  }

  function updateFavoriteButtons(type, id) {
    const active = isFavorite(type, id);
    document.querySelectorAll(".favorite-toggle").forEach((button) => {
      if (button.dataset.favoriteType !== type || button.dataset.favoriteId !== id) return;
      const favorite = favoriteRecord(favoriteKey(type, id));
      if (!favorite) return;
      const label = favoriteLabel(type, favorite.record);
      const action = active ? `${label}をお気に入りから削除` : `${label}をお気に入りに追加`;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
      button.setAttribute("aria-label", action);
      button.setAttribute("title", action);
      const symbol = button.querySelector(".favorite-symbol");
      const visibleLabel = button.querySelector(".favorite-label");
      if (symbol) symbol.textContent = active ? "★" : "☆";
      if (visibleLabel) visibleLabel.textContent = active ? "お気に入り済み" : "お気に入りに追加";
    });
  }

  function updateFavoriteCount() {
    const count = getFavoriteRecords().length;
    document.querySelectorAll(".favorite-count").forEach((badge) => {
      badge.textContent = count;
      badge.setAttribute("aria-label", `${count}件`);
    });
  }

  function announceFavoriteChange(label, active) {
    const status = document.getElementById("favoriteStatus");
    if (status) status.textContent = `${label}をお気に入り${active ? "に追加" : "から削除"}しました`;
  }

  document.querySelector(".skip-link")?.addEventListener("click", (event) => {
    event.preventDefault();
    const main = document.getElementById("main");
    if (!main) return;
    main.setAttribute("tabindex", "-1");
    window.scrollTo({ top: 0, behavior: "instant" });
    main.focus({ preventScroll: true });
  });

  document.addEventListener("click", (event) => {
    const link = event.target.closest("a");
    if (!link) return;
    [
      ["map", "google_map_click"],
      ["official", "official_link_click"],
      ["food", "food_link_click"],
      ["transit", "transit_link_click"],
      ["contact", "contact_cta_click"],
    ].forEach(([group, eventName]) => {
      const flag = `track${group.charAt(0).toUpperCase()}${group.slice(1)}`;
      if (link.dataset[flag] === "true") {
        trackEvent(eventName, trackingParameters(link, group));
      }
    });
  });

  window.addEventListener("hashchange", render);
  render();
})();
