# おさんぽクラブ東京 — 公開V1

高円寺・吉祥寺・浅草のエリア、散歩コース、スポット、読み物を掲載するGitHub Pages向けの静的サイトです。公開コンテンツはクリーンURLの実体HTMLとして配信し、検索・絞り込み・お気に入りには既存SPAを併用します。

## 公開設定

- 正式公開URL：<https://nobuja0428.github.io/osanpo/>
- basePath：`/osanpo/`
- 公開方式：GitHub Pages、リポジトリルート
- 実行時npm依存：なし
- GitHub Pages側のビルド：不要

`config.js`の正は次です。

```js
basePath: "/osanpo/",
siteUrl: "https://nobuja0428.github.io/osanpo/",
contactEmail: "",
contactFormUrl: "",
analytics: {
  enabled: false,
  provider: "ga4",
  measurementId: "",
},
```

GA4測定ID、GoogleフォームURL、公開用メールアドレスは未設定です。架空の値は設定しません。

## ファイル構成

- `index.html`：トップ。JavaScriptなしでも主要内容を表示し、JavaScript有効時は既存SPAを起動
- `areas/`、`courses/`、`spots/`、`stories/`：一覧・詳細の実体HTML
- `events/`、`map/`、`about/`、`operation/`、`editorial-policy/`、`privacy/`、`advertise/`、`contact/`：案内ページの実体HTML
- `app.js`：既存SPA、検索、絞り込み、動的表示
- `static-page.js`：静的ページのナビ、計測、外部リンク、共通お気に入りUI
- `favorites.js`：SPAと静的ページで共有する`localStorage`処理
- `analytics.js`：GA4の読み込み、page_view、イベント送信
- `data.js`：掲載コンテンツと画像参照
- `config.js`：公開URL、basePath、問い合わせ、GA4
- `styles.css`：共通デザイン
- `scripts/build-static.mjs`：クリーンURL HTMLと`sitemap.xml`の生成
- `scripts/check-site.mjs`：設定、HTML、SEO、リンク、画像SHA、秘密情報の検査
- `robots.txt`、`sitemap.xml`：検索エンジン向け設定
- `404.html`：noindex付き404
- `FIELD_RESEARCH_CHECKLIST.md`：未実施の現地確認
- `CONTENT_QUALITY_REPORT.md`：画像品質と差し替え方針

## クリーンURL

トップと次の分類・詳細、案内ページを実体HTMLとして生成します。

- `/osanpo/`
- `/osanpo/areas/` と3エリア
- `/osanpo/courses/` と3コース
- `/osanpo/spots/` と6スポット
- `/osanpo/stories/` と3記事
- `/osanpo/events/`
- `/osanpo/map/`
- `/osanpo/about/`
- `/osanpo/operation/`
- `/osanpo/editorial-policy/`
- `/osanpo/privacy/`
- `/osanpo/advertise/`
- `/osanpo/contact/`

正確な一覧は`sitemap.xml`を参照してください。

各ページは、title、description、canonical、OGP、Twitter Card、WebPage、BreadcrumbListをHTML配信時点で持ちます。トップはWebSiteとOrganizationも持ちます。OGP画像はエリア・コース・スポット・読み物では固有画像、その他はヒーロー画像です。すべて正式公開URLの絶対URLです。

## 旧ハッシュURL互換

トップの初期スクリプトが、公開コンテンツの旧ハッシュURLを対応するクリーンURLへ移動します。

```text
#/area/koenji
→ /osanpo/areas/koenji/

#/course/koenji-first
→ /osanpo/courses/koenji-first/
```

エリア、コース、スポット、読み物の詳細と、主要案内ページが対象です。検索、お気に入り、条件付き絞り込みは利用者ごとに状態が異なるため、SPAのハッシュURLを維持します。無条件転送や404のトップ転送は行いません。

## 静的ページとサイトマップの再生成

Node.js標準機能だけを使用します。`npm install`は不要です。

```bash
node scripts/build-static.mjs
node scripts/check-site.mjs
```

`build-static.mjs`は`data.js`と`config.js`を読み、共通テンプレートから生成済みHTMLと`sitemap.xml`を更新します。同じ入力で繰り返し実行しても差分は出ません。生成済みHTMLをGitHubへ配置するため、GitHub Pages側でNode.jsを実行する必要はありません。

新しいエリア、コース、スポット、読み物を追加するときは、次の順で進めます。

1. 確認済みの事実と画像を`data.js`へ追加
2. 既存IDと重複しないID、画像、alt、確認状態、公式情報を設定
3. `node scripts/build-static.mjs`
4. `node scripts/check-site.mjs`
5. ローカルHTTPサーバーで5画面幅と操作を確認
6. `sitemap.xml`と公開差分を確認

## robots、canonical、構造化データ

`robots.txt`はCSS、JavaScript、画像をブロックせず、正式な`sitemap.xml`を指定します。`sitemap.xml`には生成済みクリーンURLだけを含め、ハッシュURL、検索、お気に入り、404、架空のlastmodは含めません。

canonicalは各クリーンURL自身です。検索・お気に入り・404を検索対象の独立ページとして扱いません。構造化データに架空の法人、著者、住所、電話、評価、価格、取材日は含めません。

## GA4

初期状態では解析を行いません。

- `analytics.enabled: false`
- `analytics.measurementId: ""`
- GA4スクリプトを読み込まない

利用する場合は、運営者がGA4プロパティを作成し、正式な`G-`形式の測定IDを設定して`enabled`を`true`にします。`analytics.js`は`send_page_view: false`で読み込み、SPAと静的ページがそれぞれ1回だけpage_viewを送ります。同じ表示で二重送信しません。

SPAの計測イベントは次を維持します。

- `area_view`、`course_view`、`spot_view`、`story_view`
- `advertise_view`、`contact_view`
- `google_map_click`、`official_link_click`
- `food_link_click`、`transit_link_click`
- `favorite_change`
- `search_submit`
- `course_filter_apply`、`course_filter_remove`、`course_filter_clear`
- `contact_cta_click`

静的ページでも、ページ閲覧、コンテンツ閲覧、Googleマップ、公式リンク、食事・休憩、駅・電車、問い合わせCTA、広告掲載ページを同じ解析処理で計測できます。

生の検索語、氏名、メールアドレス、電話番号、住所、問い合わせ本文、フォーム入力、外部URL全文は独自イベントへ送りません。Cookie同意の要否とGoogle側の規約は、公開地域、法務、運用方針に応じて運営者が確認してください。

## 問い合わせと広告掲載

未設定時は、問い合わせページに準備中表示だけを出し、フォーム、送信ボタン、架空の連絡先は表示しません。広告掲載は「地域パートナー募集予定」「テスト掲載の相談受付準備中」「媒体資料準備中」「アクセス実績を蓄積中」と表示し、受付中のCTA、架空料金、実績、広告主は表示しません。

将来設定する場合：

- GoogleフォームはHTTPSの`forms.gle`または`docs.google.com/forms/`だけ
- メールは有効な公開用アドレスだけ。example系は無効
- 設定後に`node scripts/build-static.mjs`を再実行
- 外部フォームは外部遷移を表示し、`rel="noopener noreferrer"`を維持
- CTAは`contact_cta_click`で計測

## お気に入り、検索、絞り込み

お気に入りのキーは`osanpoClubFavoritesV1`を維持し、ブラウザ内だけに保存します。既存データを消さず、SPAと静的詳細ページで同じ`favorites.js`を使用します。アカウント同期やサーバー送信はありません。

検索と絞り込みはSPAで動作します。解析ではキーワードの有無と件数だけを送り、生の検索語は送りません。

## イベント

イベントは手動更新です。生成時点で現在・今後の確認済みイベントが0件の場合、トップとヘッダーで強調せず、イベントページとフッターから過去情報へ到達できます。新しい確認済みイベントを`data.js`へ追加して再生成すると、ヘッダーナビへ自動復帰します。

## 画像と現地確認

画像20点はローカルWebPで、AI生成画像を含むイメージ素材です。実景写真、店舗外観、施設記録、イベント開催記録として扱いません。今回、画像は変更しておらず、`scripts/check-site.mjs`がSHA-256を確認します。

現地取材、コース実歩行、店舗営業、トイレ利用、駅出口、混雑、バリアフリー、イベント現地確認は未実施です。`FIELD_RESEARCH_CHECKLIST.md`を使用し、確認した事実だけを更新してください。

## ローカル確認

GitHub Pagesと同じ`/osanpo/`で配信できるローカルHTTPサーバーを使用し、トップ、一覧、詳細、案内、検索、お気に入り、404を確認します。

公開前は最低限、次を実行します。

```bash
node scripts/build-static.mjs
node scripts/check-site.mjs
node --check app.js
node --check analytics.js
node --check favorites.js
node --check static-page.js
```

その後、1440px、1024px、768px、375px、320px相当で、横スクロール、ヘッダー、画像、パンくず、戻る、お気に入り、検索、0件、フィルター、地図、問い合わせ準備中、イベント0件時、meta、canonicalを実ブラウザで確認します。

## コード外の作業

次はコードで完了扱いにしません。

- GA4測定ID設定とリアルタイム確認
- Googleフォーム作成
- 公開用メール設定
- Google Search Console登録と所有権確認
- `sitemap.xml`送信
- iPhone・Android実機確認
- 現地取材
- 最新イベント確認
- Cookie同意要否の確認
- 店舗営業確認
- 掲載プラン決定
