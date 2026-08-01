import Link from "next/link";

const items = [
  ["/", "ホーム"], ["/courses/", "探す"], ["/map/", "地図"], ["/favorites/", "お気に入り"], ["/about/", "メニュー"],
] as const;

export function MobileBottomNav() {
  return <nav className="mobile-bottom-nav" aria-label="モバイル主要ナビ">{items.map(([href, label]) => <Link key={href} href={href}>{label}</Link>)}</nav>;
}
