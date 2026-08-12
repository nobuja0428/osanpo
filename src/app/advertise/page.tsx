import type { Metadata } from "next";
import { BusinessContactCta } from "@/components/BusinessContactCta";
import { PageHero } from "@/components/PageHero";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "広告掲載・地域パートナー",
  description: "おさんぽクラブ東京の広告掲載と地域パートナー募集の準備状況です。",
  alternates: { canonical: absoluteUrl("advertise/") },
};

export default function AdvertisePage() {
  return (
    <main id="main">
      <PageHero eyebrow="PARTNERS" title="広告掲載・地域パートナー" lead="東京の街を歩く人へ、地域のお店やサービスの魅力を伝える掲載相談を受け付けています。" crumbs={[{ label: "広告掲載・地域パートナー" }]} />
      <article className="section advertise-page">
        <div className="container advertise-layout">
          <section className="advertise-intro" aria-labelledby="advertise-about"><p className="eyebrow">ABOUT THE MEDIA</p><h2 id="advertise-about">おさんぽクラブ東京について</h2><p>高円寺・吉祥寺・浅草を中心に、時間・予算・気分から散歩コースを選べる地域メディアです。公開情報をもとに、コース、地図、徒歩ルート、休憩・トイレ・交通情報を整理しています。</p><p>スポンサー情報は通常コンテンツと区別し、関連する街やコースに合わせて掲載できる仕組みを用意しています。</p></section>

          <div className="advertise-section-grid">
            <section><p className="eyebrow">WHAT CAN BE SHOWN</p><h2>掲載できる内容</h2><ul><li>地域のお店・サービスの紹介</li><li>サイト共通・エリア・コース・読み物スポンサー</li><li>店舗掲載やWeb・LP制作の案内</li><li>将来の手動配置ディスプレイ広告</li></ul></section>
            <section><p className="eyebrow">AVAILABLE AREAS</p><h2>掲載可能エリア</h2><ul><li>高円寺</li><li>吉祥寺</li><li>浅草</li></ul><p>エリアが設定されたスポンサーは、該当エリアの関連ページへ優先表示できる構造です。</p></section>
            <section><p className="eyebrow">PLACEMENTS</p><h2>想定掲載位置</h2><ul><li>トップ：公開中コースの後</li><li>コース一覧：一覧の末尾</li><li>コース詳細：主要情報と確認情報の後</li><li>読み物：記事末尾（長文では中盤枠も準備）</li></ul></section>
            <section><p className="eyebrow">SPONSOR TYPES</p><h2>掲載区分</h2><ul><li>サイト共通スポンサー</li><li>エリアスポンサー</li><li>コーススポンサー</li><li>読み物スポンサー</li></ul><p>掲載内容・期間・料金はお問い合わせ後に個別にご案内します。</p></section>
          </div>

          <section className="advertise-preview-section" aria-labelledby="advertise-preview"><p className="eyebrow">DISPLAY PREVIEW</p><h2 id="advertise-preview">スポンサー表示例</h2><p>実際の広告枠に近い大きさと情報量のプレビューです。架空の店舗名・実績・料金は使用していません。</p><div className="sponsor-preview-list">{["トップページ掲載イメージ", "コースページ掲載イメージ", "読み物掲載イメージ"].map((label) => <div className="sponsor-preview" key={label}><span className="sponsor-preview-label">スポンサー掲載例</span><div><p className="eyebrow">{label}</p><h3>地域のお店・サービスの紹介枠</h3><p>ロゴや写真、紹介文、外部リンクを掲載する場合の表示例です。</p></div><span className="button button-secondary" aria-hidden="true">詳しく見る</span></div>)}</div></section>

          <section className="advertise-process" aria-labelledby="advertise-process"><p className="eyebrow">PROCESS</p><h2 id="advertise-process">掲載までの流れ</h2><ol><li><strong>相談</strong><span>Googleフォームで掲載内容と対象エリアをお知らせください。</span></li><li><strong>確認</strong><span>掲載位置、期間、表現、リンク先を個別に確認します。</span></li><li><strong>原稿確認</strong><span>広告であることを明示した表示内容をご確認いただきます。</span></li><li><strong>掲載</strong><span>合意した期間と対象ページへ公開します。</span></li></ol></section>

          <section className="advertise-faq" aria-labelledby="advertise-faq"><p className="eyebrow">FAQ</p><h2 id="advertise-faq">よくある質問</h2><details><summary>料金は決まっていますか？</summary><p>掲載内容・位置・期間を確認したうえで個別にご案内します。サイト上に未確定の料金は表示していません。</p></details><details><summary>掲載効果は保証されますか？</summary><p>成果、検索順位、来店数、売上などは保証しません。内容との関連性と読みやすさを優先して掲載します。</p></details><details><summary>どの地域でも掲載できますか？</summary><p>現在の一般向けコンテンツは高円寺・吉祥寺・浅草が中心です。その他の地域は掲載内容を確認してご案内します。</p></details><details><summary>Google AdSenseも配信していますか？</summary><p>現在は実広告配信開始前です。承認・同意設定・実在するIDがそろうまでGoogleの広告スクリプトは読み込みません。</p></details></section>

          <section className="advertise-contact" aria-labelledby="advertise-contact"><div><p className="eyebrow">CONTACT</p><h2 id="advertise-contact">スポンサー掲載について相談する</h2><p>店舗名、対象エリア、希望する掲載内容が決まっている範囲で構いません。Googleフォームからご相談ください。</p></div><BusinessContactCta placement="advertise-sponsor-consultation" label="スポンサー掲載について相談する" /></section>
        </div>
      </article>
    </main>
  );
}
