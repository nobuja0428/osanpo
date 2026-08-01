import Link from "next/link";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <h2>おさんぽクラブ東京</h2>
          <p>公開情報をもとに、東京の散歩コースを探しやすく整理する地域メディアです。</p>
        </div>
        <div>
          <h2>探す</h2>
          <div className="footer-links">
            <Link href="/areas/">エリア</Link>
            <Link href="/courses/">コース</Link>
            <Link href="/spots/">スポット</Link>
            <Link href="/stories/">読み物</Link>
            <Link href="/events/">イベント</Link>
            <Link href="/map/">地図</Link>
          </div>
        </div>
        <div>
          <h2>運営</h2>
          <div className="footer-links">
            <Link href="/about/">サイトについて</Link>
            <Link href="/editorial-policy/">編集方針</Link>
            <Link href="/operation/">運営情報</Link>
            <Link href="/privacy/">プライバシー</Link>
            <Link href="/advertise/">広告掲載</Link>
            <Link href="/contact/">お問い合わせ</Link>
          </div>
        </div>
      </div>
      <div className="container footer-bottom">© 2026 おさんぽクラブ東京</div>
    </footer>
  );
}
