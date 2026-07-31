import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ページが見つかりません",
  description: "指定されたページは見つかりませんでした。",
  robots: { index: false, follow: true },
  alternates: { canonical: null },
};

export default function NotFound() {
  return (
    <main id="main" className="section">
      <div className="narrow empty-state">
        <p className="eyebrow">404</p>
        <h1>ページが見つかりません</h1>
        <p>URLが変わったか、ページがまだ準備中の可能性があります。</p>
        <Link className="button button-primary" href="/">トップへ戻る</Link>
      </div>
    </main>
  );
}
