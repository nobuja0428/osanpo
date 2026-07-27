(() => {
  const DATA = window.OSANPO_DATA;
  const CONFIG = window.OSANPO_CONFIG;
  const app = document.getElementById("app");
  const SITE_INFO = DATA.siteInfo || {};
  const img = (key) => DATA.images[key] || DATA.images.hero;
  const escapeHtml = (value = "") => String(value).replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char]));
  const safeExternalUrl = (value = "") => {
    try {
      const url = new URL(value);
      return ["https:", "http:"].includes(url.protocol) ? url.href : "";
    } catch {
      return "";
    }
  };
  const configuredEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(CONFIG.contactEmail || "") && !/@example\.(com|jp)$/i.test(CONFIG.contactEmail) ? CONFIG.contactEmail : "";
  const configuredFormUrl = safeExternalUrl(CONFIG.contactFormUrl);
  const mapsPlaceUrl = (query) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  const mapsEmbedUrl = (query) => `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
  const courseRouteUrl = (course) => {
    const [first, ...rest] = course.stops;
    const last = rest.pop();
    const waypoints = rest.map((s) => s.query).join("|");
    return `https://www.google.com/maps/dir/?api=1&travelmode=walking&origin=${encodeURIComponent(first.query)}&destination=${encodeURIComponent(last.query)}${waypoints ? `&waypoints=${encodeURIComponent(waypoints)}` : ""}`;
  };
  const routeParts = () => location.hash.split("?")[0].replace(/^#\/?/, "").split("/").filter(Boolean);
  const eventState = (event, now = Date.now()) => {
    if (event.status === "中止" || event.status === "延期") return event.status;
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
  const imageDisclosure = "掲載画像は、街や散歩体験の雰囲気を表現する参考イメージです。実際の街並み、店舗、施設の記録写真とは異なる場合があります。AI生成画像を使用する場合も「イメージ」と表示します。";

  function imageMarkup(imageKey, alt, className = "") {
    return `<div class="${className}"><img loading="lazy" decoding="async" src="${img(imageKey)}" alt="${escapeHtml(alt)}"><span class="image-label">イメージ</span></div>`;
  }

  function header() {
    const current = routeParts()[0] || "home";
    const nav = [
      ["areas", "エリアから探す"],
      ["courses", "おさんぽコース"],
      ["spots", "スポット紹介"],
      ["events", "イベント"],
      ["map", "地図で探す"],
      ["about", "はじめての方"],
      ["contact", "お問い合わせ"],
    ];
    return `
      <header class="site-header">
        <div class="container header-inner">
          <a class="brand" href="#/" aria-label="トップページ">
            <span class="brand-mark">歩</span>
            <span class="brand-copy"><strong>${escapeHtml(CONFIG.siteName)}</strong><span>${escapeHtml(CONFIG.siteSubtitle)}</span></span>
          </a>
          <nav class="site-nav" id="siteNav" aria-label="メインナビゲーション">
            ${nav.map(([path, label]) => `<a href="#/${path}" ${current === path ? 'aria-current="page"' : ""}>${label}</a>`).join("")}
          </nav>
          <button class="nav-toggle" aria-label="メニューを開く" aria-controls="siteNav" aria-expanded="false">☰</button>
        </div>
      </header>`;
  }

  function footer() {
    return `
      <footer class="site-footer">
        <div class="container footer-inner">
          <div><h3>おさんぽクラブ東京</h3><p>公開情報をもとに、AIによる構成・表現の補助も利用して東京の街歩きプランを編集するメディアです。${imageDisclosure}</p></div>
          <div><h3>探す</h3><div class="footer-links"><a href="#/areas">エリア</a><a href="#/courses">コース</a><a href="#/spots">スポット</a><a href="#/events">イベント</a><a href="#/map">お散歩マップ</a></div></div>
          <div><h3>運営</h3><div class="footer-links"><a href="#/operation">運営情報</a><a href="#/policy">編集方針</a><a href="#/privacy">プライバシーポリシー</a><a href="#/advertising">広告掲載</a><a href="#/contact">お問い合わせ</a><a href="README.md">GitHub版について</a></div></div>
        </div>
        <div class="container footer-bottom">© 2026 おさんぽクラブ東京</div>
      </footer>`;
  }

  function breadcrumbs(items) {
    return `<nav class="breadcrumbs" aria-label="パンくず">${items.map((item, i) => i === items.length - 1 ? `<span>${escapeHtml(item.label)}</span>` : `<a href="${item.href}">${escapeHtml(item.label)}</a><span>›</span>`).join("")}</nav>`;
  }

  function trustPanel(record = {}, sources = []) {
    const meta = { ...SITE_INFO, ...record };
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
      ${sourceLinks.length ? `<ul class="source-list">${sourceLinks.map((source) => `<li><a href="${source.url}" target="_blank" rel="noopener noreferrer">${escapeHtml(source.label)}</a></li>`).join("")}</ul>` : "<p>個別の参照先は未記録です。訪問前に施設・自治体等の公式情報をご確認ください。</p>"}
      <p class="image-disclosure">${imageDisclosure}</p>
    </aside>`;
  }

  function areaCard(area) {
    return `<article class="card">
      <a href="#/area/${area.id}">
        ${imageMarkup(area.image, `${area.name}の街並みを表現したイメージ`, "card-media")}
        <div class="card-body">
          <span class="card-kicker">${escapeHtml(area.ward)}</span>
          <h3>${escapeHtml(area.name)}</h3>
          <p>${escapeHtml(area.lead)}</p>
          <div class="card-meta"><span class="pill pill--green">${escapeHtml(area.publicationStatus)}</span>${area.tags.map((tag) => `<span class="pill">${escapeHtml(tag)}</span>`).join("")}</div>
        </div>
      </a>
    </article>`;
  }

  function courseCard(course) {
    const area = DATA.areas.find((a) => a.id === course.areaId);
    return `<article class="card">
      <a href="#/course/${course.id}">
        ${imageMarkup(course.image, `${area.name}の散歩コースを表現したイメージ`, "card-media")}
        <div class="card-body">
          <span class="card-kicker">${escapeHtml(area.name)}</span>
          <h3>${escapeHtml(course.title)}</h3>
          <p>${escapeHtml(course.summary)}</p>
          <div class="card-meta"><span class="pill">${course.distance}</span><span class="pill">${course.duration}</span><span class="pill">${course.stops.length}地点</span></div>
        </div>
      </a>
    </article>`;
  }

  function spotCard(spot) {
    const area = DATA.areas.find((a) => a.id === spot.areaId);
    return `<article class="card">
      <a href="#/spot/${spot.id}">
        ${imageMarkup(spot.image, `${spot.name}周辺を表現したイメージ`, "card-media")}
        <div class="card-body">
          <span class="card-kicker">${escapeHtml(spot.category)}・${escapeHtml(area.name)}</span>
          <h3>${escapeHtml(spot.name)}</h3>
          <p>${escapeHtml(spot.excerpt)}</p>
        </div>
      </a>
    </article>`;
  }

  function storyCard(story) {
    return `<article class="card">
      <a href="#/story/${story.id}">
        ${imageMarkup(story.image, `${story.title}の内容を表現したイメージ`, "card-media")}
        <div class="card-body">
          <span class="card-kicker">${escapeHtml(story.category)}・${escapeHtml(story.readTime)}</span>
          <h3>${escapeHtml(story.title)}</h3>
          <p>${escapeHtml(story.excerpt)}</p>
        </div>
      </a>
    </article>`;
  }

  function eventCard(event, compact = false) {
    const state = eventState(event);
    const statusClass = state === "終了" ? "pill--ended" : state === "中止" ? "pill--cancelled" : state === "情報更新待ち" || state === "延期" ? "pill--pending" : "pill--accent";
    const officialUrl = safeExternalUrl(event.officialUrl);
    return `<article class="${compact ? "event-row" : "card"}">
      ${compact ? `<div class="event-thumb">${imageMarkup(event.image, `${event.title}をイメージした画像`, "")}</div>` : imageMarkup(event.image, `${event.title}をイメージした画像`, "card-media")}
      <div class="${compact ? "" : "card-body"}">
        <span class="event-date">${formatDateRange(event.start, event.end)}</span>
        <h3>${escapeHtml(event.title)}</h3>
        <p>${escapeHtml(event.venue)}・${escapeHtml(event.price)}</p>
        <div class="card-meta"><span class="pill ${statusClass}">${escapeHtml(state)}</span><span class="pill">${escapeHtml(event.area)}</span></div>
        <p class="image-disclosure">情報確認日：${escapeHtml(event.informationCheckedAt || "未記録")}／最終更新日：${escapeHtml(event.lastUpdated || "未記録")}</p>
        <p class="image-disclosure">開催内容は変更・中止になる場合があります。最新情報は公式情報をご確認ください。</p>
      </div>
      ${compact ? `<div class="event-actions">${officialUrl ? `<a class="btn btn--small" href="${officialUrl}" target="_blank" rel="noopener noreferrer">公式情報</a>` : "<span>公式URL未登録</span>"}<a class="btn btn--small" href="${mapsPlaceUrl(event.mapQuery)}" target="_blank" rel="noopener noreferrer">地図</a></div>` : ""}
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
              <img src="${img("hero")}" alt="東京の街を歩く体験を表現したイメージ">
              <span class="image-label">イメージ</span>
              <div class="hero-copy">
                <span class="eyebrow">TOKYO SANPO CLUB</span>
                <h1>東京には、歩くと楽しい<br>まちがたくさんある。</h1>
                <p>下町の路地、個性あふれる商店街、緑豊かな公園や川沿いの道。お気に入りのエリアを見つけて、あなただけのおさんぽを。</p>
                <div class="hero-actions"><a class="btn btn--accent" href="#/areas">エリアから探す</a><a class="btn btn--ghost" href="#/about">はじめての方へ</a></div>
              </div>
            </div>
            <form class="search-panel search-panel--basic" id="heroSearch">
              <input class="form-control" name="keyword" aria-label="キーワード" placeholder="高円寺、喫茶店、雨の日…">
              <select class="form-control" name="area" aria-label="エリア"><option value="">すべてのエリア</option>${DATA.areas.map((a) => `<option value="${a.id}">${a.name}</option>`).join("")}</select>
              <button class="btn btn--dark" type="submit">探す</button>
            </form>
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
    const configs = {
      areas: ["エリアから探す", "東京の街を、雰囲気・所要時間・目的から選べます。", DATA.areas.map(areaCard)],
      courses: ["おさんぽコース", "STARTからGOALまで、実在地点とGoogleマップで確認できます。", DATA.courses.map(courseCard)],
      spots: ["スポット紹介", "商店街、公園、神社、文化施設など、散歩に組み込みやすい場所を紹介します。", DATA.spots.map(spotCard)],
      stories: ["街の読み物", "ルート一覧だけでなく、街を歩く理由と楽しみ方を読み物として紹介します。", DATA.stories.map(storyCard)],
    };
    const [title, lead, cards] = configs[type];
    const areaNotice = type === "areas" ? `<div class="availability-note"><strong>${escapeHtml(SITE_INFO.expansionMessage)}</strong><span>現在は高円寺・吉祥寺・浅草の基本ガイドを公開中。その他${SITE_INFO.plannedAreaCount}エリアは記事準備中です。</span></div>` : "";
    return `${header()}<main id="main"><section class="page-hero"><div class="container">${breadcrumbs([{ href: "#/", label: "トップ" }, { label: title }])}<span class="eyebrow">DISCOVER TOKYO</span><h1>${title}</h1><p>${lead}</p></div></section><section class="section section--compact"><div class="container">${areaNotice}<div class="grid grid--3">${cards.join("")}</div></div></section></main>${footer()}`;
  }

  function areaPage(id) {
    const area = DATA.areas.find((a) => a.id === id);
    if (!area) return notFound();
    const courses = DATA.courses.filter((c) => c.areaId === id);
    const spots = DATA.spots.filter((s) => s.areaId === id);
    const stories = DATA.stories.filter((s) => s.areaId === id);
    return `${header()}<main id="main">
      <section class="page-hero"><div class="container">${breadcrumbs([{ href: "#/", label: "トップ" }, { href: "#/areas", label: "エリア" }, { label: area.name }])}<div class="page-hero-inner"><div><span class="eyebrow">${area.ward}</span><h1>${area.name}</h1><p>${area.description}</p><div class="card-meta"><span class="pill pill--green">${area.publicationStatus}</span><span class="pill">${area.duration}</span><span class="pill">${area.budget}</span>${area.tags.map((t) => `<span class="pill pill--green">${t}</span>`).join("")}</div><p style="margin-top:24px"><a class="btn btn--accent" href="#/map/${area.id}">地図で見る</a></p></div>${imageMarkup(area.image, `${area.name}の街並みを表現した参考イメージ`, "page-hero-media")}</div>${trustPanel(area, area.officialSources)}</div></section>
      <section class="section section--surface"><div class="container"><div class="section-heading"><div><span class="eyebrow">COURSES</span><h2>${area.name}のおさんぽコース</h2></div></div><div class="grid grid--3">${courses.map(courseCard).join("")}</div></div></section>
      <section class="section"><div class="container"><div class="section-heading"><div><span class="eyebrow">SPOTS</span><h2>立ち寄りたい場所</h2></div></div><div class="grid grid--3">${spots.map(spotCard).join("")}</div></div></section>
      <section class="section section--soft"><div class="container"><div class="section-heading"><div><span class="eyebrow">STORIES</span><h2>${area.name}を読む</h2></div></div><div class="grid grid--3">${stories.map(storyCard).join("")}</div></div></section>
    </main>${footer()}`;
  }

  function coursePage(id) {
    const course = DATA.courses.find((c) => c.id === id);
    if (!course) return notFound();
    const area = DATA.areas.find((a) => a.id === course.areaId);
    return `${header()}<main id="main"><section class="article-header"><div class="narrow">${breadcrumbs([{ href: "#/", label: "トップ" }, { href: "#/courses", label: "コース" }, { label: course.title }])}<span class="eyebrow">${area.name}・モデルコース</span><h1>${course.title}</h1><p class="article-lead">${course.summary}</p><div class="card-meta"><span class="pill">${course.distance}</span><span class="pill">${course.duration}</span><span class="pill">${course.budget}</span><span class="pill">${course.audience}</span></div><div class="article-cover">${imageMarkup(course.image, `${course.title}を表現した参考イメージ`, "")}</div>${trustPanel(course, area.officialSources)}</div></section>
    <section class="section section--compact"><div class="container map-layout"><div class="map-shell"><iframe loading="lazy" src="${mapsEmbedUrl(area.mapQuery)}" title="${escapeHtml(course.title)}の地図"></iframe></div><div><h2>立ち寄り地点</h2><div class="stop-list">${course.stops.map((stop, i) => `<div class="stop-card"><span class="stop-number">${i + 1}</span><div><strong>${escapeHtml(stop.name)}</strong><span>${escapeHtml(stop.category)}</span></div><a class="btn btn--small" href="${mapsPlaceUrl(stop.query)}" target="_blank" rel="noopener">地図</a></div>`).join("")}</div><p><a class="btn btn--accent" href="${courseRouteUrl(course)}" target="_blank" rel="noopener">Googleマップでルート全体を開く</a></p></div></div></section>
    <section class="section section--soft"><div class="narrow article-body"><h2>この順番で歩く理由</h2><p>駅の近くから始め、街の特徴が切り替わる方向へ進むことで、同じ道を戻らずに歩ける構成です。営業状況や工事、混雑により変わるため、来訪前に公式情報とGoogleマップをご確認ください。</p><div class="article-note">距離と徒歩時間は地図情報をもとにした概算です。信号待ち、休憩、立ち寄り時間は含まれない場合があります。</div></div></section></main>${footer()}`;
  }

  function storyPage(id) {
    const story = DATA.stories.find((s) => s.id === id);
    if (!story) return notFound();
    const area = DATA.areas.find((a) => a.id === story.areaId);
    const related = DATA.spots.filter((s) => s.areaId === story.areaId).slice(0, 3);
    return `${header()}<main id="main"><article><header class="article-header"><div class="narrow">${breadcrumbs([{ href: "#/", label: "トップ" }, { href: "#/stories", label: "読み物" }, { label: story.title }])}<span class="eyebrow">${story.category}・${story.readTime}</span><h1>${story.title}</h1><p class="article-lead">${story.excerpt}</p><div class="article-cover">${imageMarkup(story.image, `${story.title}を表現した参考イメージ`, "")}</div>${trustPanel(story, area.officialSources)}</div></header><div class="narrow article-body"><p>${story.intro}</p>${story.sections.map((s) => `<h2>${escapeHtml(s.heading)}</h2><p>${escapeHtml(s.body)}</p>`).join("")}<p><a class="btn btn--dark" href="#/area/${area.id}">${area.name}のエリアガイドへ</a></p></div></article><section class="section section--soft"><div class="container"><div class="section-heading"><div><span class="eyebrow">RELATED</span><h2>関連スポット</h2></div></div><div class="grid grid--3">${related.map(spotCard).join("")}</div></div></section></main>${footer()}`;
  }

  function spotPage(id) {
    const spot = DATA.spots.find((s) => s.id === id);
    if (!spot) return notFound();
    const area = DATA.areas.find((a) => a.id === spot.areaId);
    const officialUrl = safeExternalUrl(spot.officialUrl);
    return `${header()}<main id="main"><section class="article-header"><div class="narrow">${breadcrumbs([{ href: "#/", label: "トップ" }, { href: "#/spots", label: "スポット" }, { label: spot.name }])}<span class="eyebrow">${spot.category}・${area.name}</span><h1>${spot.name}</h1><p class="article-lead">${spot.excerpt}</p><div class="article-cover">${imageMarkup(spot.image, `${spot.name}周辺を表現した参考イメージ`, "")}</div>${trustPanel(spot, officialUrl ? [{ label: spot.name, url: officialUrl }] : [])}</div></section><section class="section section--compact"><div class="container map-layout"><div class="map-shell"><iframe loading="lazy" src="${mapsEmbedUrl(spot.mapQuery)}" title="${escapeHtml(spot.name)}のGoogleマップ"></iframe></div><div class="contact-panel"><h2>行く前に確認</h2><p>営業時間、休館日、料金などは変更される場合があります。訪問前に公式情報をご確認ください。</p>${officialUrl ? `<p><a class="btn btn--accent" href="${officialUrl}" target="_blank" rel="noopener noreferrer">公式情報</a></p>` : "<p>公式URLは未登録です。</p>"}<p><a class="btn" href="${mapsPlaceUrl(spot.mapQuery)}" target="_blank" rel="noopener noreferrer">Googleマップで開く</a></p><p><a class="text-link" href="#/area/${area.id}">${area.name}のガイドへ →</a></p></div></div></section></main>${footer()}`;
  }

  function mapPage(areaId) {
    const selectedArea = DATA.areas.find((a) => a.id === areaId) || DATA.areas[0];
    const course = DATA.courses.find((c) => c.areaId === selectedArea.id);
    return `${header()}<main id="main"><section class="page-hero"><div class="container">${breadcrumbs([{ href: "#/", label: "トップ" }, { label: "お散歩マップ" }])}<span class="eyebrow">GOOGLE MAPS</span><h1>お散歩マップ</h1><p>実用地図はGoogleマップを使用します。地点番号と記事の順番を合わせ、外部地図でルート全体を開けます。</p><div class="card-meta">${DATA.areas.map((area) => `<a class="pill ${area.id === selectedArea.id ? "pill--accent" : ""}" href="#/map/${area.id}">${area.name}</a>`).join("")}</div></div></section><section class="section section--compact"><div class="container map-layout"><div class="map-shell"><iframe loading="lazy" src="${mapsEmbedUrl(selectedArea.mapQuery)}" title="${selectedArea.name}のお散歩マップ"></iframe></div><div><span class="eyebrow">${selectedArea.name}</span><h2>${course.title}</h2><p>${course.summary}</p><div class="stop-list">${course.stops.map((stop, i) => `<div class="stop-card"><span class="stop-number">${i + 1}</span><div><strong>${escapeHtml(stop.name)}</strong><span>${escapeHtml(stop.category)}</span></div><a class="btn btn--small" target="_blank" rel="noopener" href="${mapsPlaceUrl(stop.query)}">開く</a></div>`).join("")}</div><p><a class="btn btn--accent" target="_blank" rel="noopener" href="${courseRouteUrl(course)}">ルート全体をGoogleマップで開く</a></p></div></div></section></main>${footer()}`;
  }

  function eventsPage() {
    const currentEvents = DATA.events.filter((event) => eventState(event) !== "終了").sort((a, b) => new Date(a.start) - new Date(b.start));
    const pastEvents = DATA.events.filter((event) => eventState(event) === "終了").sort((a, b) => new Date(b.end) - new Date(a.end));
    return `${header()}<main id="main"><section class="page-hero"><div class="container">${breadcrumbs([{ href: "#/", label: "トップ" }, { label: "イベント" }])}<span class="eyebrow">EVENTS</span><h1>掲載イベント情報</h1><p>イベントは手動更新です。終了日時による状態判定のみ自動で行い、新規掲載、中止、延期、公式情報の確認は手動で管理します。</p></div></section><section class="section section--compact"><div class="container"><h2>現在・今後のイベント</h2>${currentEvents.length ? `<div class="event-list">${currentEvents.map((event) => eventCard(event, true)).join("")}</div>` : `<div class="empty-state"><h3>現在、確認済みのイベント情報はありません</h3><p>新しい情報を確認後に掲載します。</p></div>`}${pastEvents.length ? `<h2 style="margin-top:48px">過去のイベント</h2><div class="event-list">${pastEvents.map((event) => eventCard(event, true)).join("")}</div>` : ""}</div></section></main>${footer()}`;
  }

  function aboutPage() {
    return `${header()}<main id="main"><section class="page-hero"><div class="narrow">${breadcrumbs([{ href: "#/", label: "トップ" }, { label: "はじめての方" }])}<span class="eyebrow">ABOUT</span><h1>おさんぽクラブ東京について</h1><p>公式情報、自治体、施設、地図情報などを参考に、東京の街歩きプランを編集しています。</p></div></section><section class="section section--compact"><div class="narrow article-body"><h2>現在の公開範囲</h2><p>${escapeHtml(SITE_INFO.expansionMessage)} 現在は高円寺・吉祥寺・浅草の基本ガイドを公開し、その他のエリアは記事準備中です。</p><h2>来訪前の確認</h2><p>営業時間、定休日、料金、イベント内容は変更される場合があります。訪問前に必ず公式情報をご確認ください。</p><p><a class="btn btn--accent" href="#/policy">編集方針を読む</a> <a class="btn" href="#/areas">エリア一覧へ</a></p></div></section></main>${footer()}`;
  }

  function operationPage() {
    const contactState = configuredEmail || configuredFormUrl ? "公開中の受付方法は、お問い合わせページで案内しています。" : "現在、公開用の問い合わせ先を準備中です。受付開始後はお問い合わせページで案内します。";
    return `${header()}<main id="main"><section class="page-hero"><div class="narrow">${breadcrumbs([{ href: "#/", label: "トップ" }, { label: "運営情報" }])}<span class="eyebrow">OPERATION</span><h1>運営情報</h1><p>おさんぽクラブ東京編集部が、公開情報をもとに運営しています。</p></div></section><section class="section section--compact"><div class="narrow article-body"><h2>運営方針</h2><p>現地取材の有無と公開情報による作成を区別し、未確認の営業時間、料金、イベント日時を断定しません。</p><h2>連絡先</h2><p>${contactState}</p><p><a class="btn" href="#/contact">お問い合わせ</a> <a class="btn" href="#/">トップへ戻る</a></p></div></section></main>${footer()}`;
  }

  function policyPage() {
    return `${header()}<main id="main"><section class="page-hero"><div class="narrow">${breadcrumbs([{ href: "#/", label: "トップ" }, { label: "編集方針" }])}<span class="eyebrow">EDITORIAL POLICY</span><h1>編集方針</h1><p>確認できた事実と、編集上の提案・イメージを区別します。</p></div></section><section class="section section--compact"><div class="narrow article-body"><h2>情報の作成方法</h2><p>記事、エリア、コースは公開情報をもとに作成しています。現地取材は未実施で、現地の歩きやすさ、休憩候補、最新状況は今後確認予定です。</p><h2>AI利用</h2><p>文章の構成や表現の補助にAIを利用しています。未確認情報を事実として追加しない方針です。</p><h2>画像について</h2><p>${imageDisclosure}</p><p>現在の外部参考画像は、実在店舗の外観や施設の記録写真として扱いません。公開用素材としての最終確定には、利用条件の再確認が必要です。</p><h2>更新情報</h2><p>最終更新日：${escapeHtml(SITE_INFO.lastUpdated || "未記録")}。営業時間、料金、イベント内容は変更される可能性があるため、訪問前に公式情報をご確認ください。</p></div></section></main>${footer()}`;
  }

  function privacyPage() {
    const contactPrivacy = configuredEmail || configuredFormUrl ? "お問い合わせ時に入力した情報は、利用者が選択したメールまたは外部フォームの提供元へ送信されます。" : "現在、問い合わせフォームと送信先は未設定で、サイト上で個人情報を送信する機能は表示していません。";
    return `${header()}<main id="main"><section class="page-hero"><div class="narrow">${breadcrumbs([{ href: "#/", label: "トップ" }, { label: "プライバシーポリシー" }])}<span class="eyebrow">PRIVACY</span><h1>プライバシーポリシー</h1><p>現在のサイト実装に合わせた情報の取り扱いを説明します。</p></div></section><section class="section section--compact"><div class="narrow article-body"><h2>取得していない情報</h2><p>このコードにはアクセス解析、会員登録、決済、ブラウザの位置情報取得機能はありません。</p><h2>外部サービス</h2><p>Googleマップの埋め込みや外部リンク、外部画像を表示する際、各サービスへ通信が発生します。各サービス側の情報取り扱いは、それぞれの規約とプライバシーポリシーをご確認ください。</p><h2>お問い合わせ</h2><p>${contactPrivacy}</p><p><a class="btn" href="#/">トップへ戻る</a></p></div></section></main>${footer()}`;
  }

  function advertisingPage() {
    return `${header()}<main id="main"><section class="page-hero"><div class="narrow">${breadcrumbs([{ href: "#/", label: "トップ" }, { label: "広告掲載" }])}<span class="eyebrow">PARTNERS</span><h1>広告掲載・地域パートナー</h1><p>現在、正式な掲載プランと受付方法を準備しています。</p></div></section><section class="section section--compact"><div class="narrow article-body"><div class="article-note">地域パートナー募集予定／テスト掲載の相談受付準備中／媒体資料準備中／アクセス実績を蓄積中です。</div><p>架空のアクセス数、掲載実績、固定料金は表示していません。広告を掲載する場合は「PR」と明示し、編集記事と区別します。</p><p>受付開始後は、このページとお問い合わせページで案内します。</p><p><a class="btn" href="#/contact">お問い合わせ状況を確認</a> <a class="btn" href="#/">トップへ戻る</a></p></div></section></main>${footer()}`;
  }

  function contactPage() {
    const methods = [];
    if (configuredFormUrl) methods.push(`<a class="btn btn--accent" href="${configuredFormUrl}" target="_blank" rel="noopener noreferrer">お問い合わせフォームを開く</a>`);
    if (configuredEmail) methods.push(`<a class="btn btn--accent" href="mailto:${encodeURIComponent(configuredEmail)}">メールで問い合わせる</a>`);
    const contactBody = methods.length
      ? `<div class="contact-panel"><h2>受付方法</h2><div class="form-actions">${methods.join("")}</div><p>外部サービスまたはメールアプリが開きます。送信前に宛先をご確認ください。</p></div>`
      : `<div class="contact-panel"><h2>現在、お問い合わせ受付を準備中です</h2><p>公開用メールアドレスまたは外部フォームが未設定のため、送信フォームと送信ボタンは表示していません。</p><p>受付開始後は、このページで案内します。</p></div>`;
    return `${header()}<main id="main"><section class="page-hero"><div class="container">${breadcrumbs([{ href: "#/", label: "トップ" }, { label: "お問い合わせ" }])}<span class="eyebrow">CONTACT</span><h1>情報訂正・お問い合わせ</h1><p>${methods.length ? "公開中の受付方法をご利用ください。" : "現在、お問い合わせ受付を準備中です。"}</p></div></section><section class="section section--compact"><div class="container">${contactBody}<div class="empty-actions"><a class="btn" href="#/">トップへ戻る</a><a class="btn" href="#/operation">運営情報</a><a class="btn" href="#/advertising">広告掲載</a></div></div></section></main>${footer()}`;
  }

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
    return `${header()}<main id="main"><section class="page-hero"><div class="narrow"><span class="eyebrow">404</span><h1>ページが見つかりません</h1><p><a class="btn btn--accent" href="#/">トップへ戻る</a></p></div></section></main>${footer()}`;
  }

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
    else if (type === "about") html = aboutPage();
    else if (type === "operation") html = operationPage();
    else if (type === "policy") html = policyPage();
    else if (type === "privacy") html = privacyPage();
    else if (type === "advertising") html = advertisingPage();
    else if (type === "contact") html = contactPage();
    else if (type === "search") html = searchResults();
    else html = notFound();
    app.innerHTML = html;
    bindInteractions();
    window.scrollTo({ top: 0, behavior: "instant" });
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
      if (form.get("keyword")) params.set("keyword", form.get("keyword"));
      if (form.get("area")) params.set("area", form.get("area"));
      location.hash = `#/search?${params.toString()}`;
    });

  }

  window.addEventListener("hashchange", render);
  render();
})();
