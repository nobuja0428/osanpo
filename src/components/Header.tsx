"use client";

import Link from "next/link";
import { useState } from "react";

const links = [
  ["/areas/", "エリア"],
  ["/courses/", "コース"],
  ["/spots/", "スポット"],
  ["/stories/", "読み物"],
  ["/events/", "イベント"],
  ["/search/", "検索"],
  ["/favorites/", "お気に入り"],
] as const;

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link className="brand" href="/" aria-label="おさんぽクラブ東京 トップ">
          <span className="brand-mark" aria-hidden="true">歩</span>
          <span><strong>おさんぽクラブ東京</strong><small>Tokyo Sanpo Club</small></span>
        </Link>
        <button
          className="nav-toggle"
          type="button"
          aria-expanded={open}
          aria-controls="site-nav"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? "閉じる" : "メニュー"}
        </button>
        <nav id="site-nav" className={open ? "site-nav is-open" : "site-nav"} aria-label="メインナビゲーション">
          {links.map(([href, label]) => (
            <Link key={href} href={href} onClick={() => setOpen(false)}>{label}</Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
