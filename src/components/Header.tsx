import Link from "next/link";

const links = [
  ["/courses/", "コース"], ["/areas/", "エリア"], ["/spots/", "スポット"], ["/events/", "イベント"], ["/map/", "地図"], ["/search/", "検索"], ["/favorites/", "お気に入り"], ["/business/", "事業者向け"],
] as const;

const desktopLinks = [
  ["/courses/", "コース"], ["/areas/", "エリア"], ["/map/", "地図"], ["/stories/", "読み物"], ["/business/", "事業者向け"],
] as const;

function Navigation() {
  return <>{links.map(([href, label]) => <Link key={href} href={href}>{label}</Link>)}</>;
}

export function Header() {
  return <header className="site-header"><div className="container header-inner">
    <Link className="brand" href="/" aria-label="おさんぽクラブ東京 トップ"><span className="brand-mark" aria-hidden="true">歩</span><span><strong>おさんぽクラブ東京</strong><small>Tokyo Sanpo Club</small></span></Link>
    <nav className="desktop-nav" aria-label="メインナビゲーション">{desktopLinks.map(([href, label]) => <Link key={href} href={href}>{label}</Link>)}<Link className="header-plan-cta" href="/plan/">今日のおさんぽを選ぶ</Link></nav>
    <details className="mobile-nav"><summary className="nav-toggle">メニュー</summary><nav aria-label="モバイルナビゲーション"><Navigation /></nav></details>
  </div></header>;
}
