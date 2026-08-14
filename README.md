# おさんぽクラブ東京

東京の散歩先を、時間・予算・同行者・気分・エリアから探せる地域メディアです。Next.js App Router と TypeScript で実装し、GitHub Pages 向けに静的 HTML を生成します。

## 正式な公開設定

- リポジトリ：`nobuja0428/osanpo`
- 公開URL：`https://nobuja0428.github.io/osanpo/`
- basePath：`/osanpo/`
- 公開方式：GitHub Pages

旧参考サイトの名前・basePath・URLは使用しません。

## Phase 1 の実装内容

- Next.js App Router、TypeScript、静的書き出し
- 高円寺・吉祥寺・浅草の3エリア
- 3コース、6スポット、3読み物、4イベント
- エリア、コース、スポット、読み物の静的詳細URL
- サイト内検索
- エリア・時間・予算・同行者・気分・キーワードによるコース絞り込み
- 0件時の案内と条件解除
- 既存キー `osanpoClubFavoritesV1` を維持したお気に入り
- 旧ハッシュURLから新しい静的URLへの互換転送
- `/osanpo/` に統一した内部リンク、画像、canonical、OGP、sitemap、robots
- GA4の安全な任意設定
- Vitest、ESLint、TypeScript検査、GitHub Actions

## 収益化・回遊アップデート

- 30秒診断をトップの主導線として維持し、診断ロジック・URL復元・お気に入り・地図を変更せずに回遊を強化
- 実データが2件以上あり、結果集合も重複しない条件だけを `/courses/conditions/` 配下へ公開（ひとり、商店街）。近似条件は一覧フィルターと30秒診断で扱います。
- コース・エリア・スポット・読み物の末尾に、同じエリアの実データだけを使う関連リンクを表示
- House Adを「広告掲載・スポンサー募集」として明示し、成果・来店数・売上を保証しない文言を追加
- `/advertise/` に利用者行動、掲載位置、スポンサー種別、編集記事との区別、掲載基準、流れ、FAQ、媒体実績蓄積中の表示を追加
- サイト全体・各エリア・各コースのスポンサーは各1社を上限とする設定検証を追加
- 実スポンサー、Affiliate、AdSenseは引き続きOFF。公開料金は運営者承認まで個別案内
- 競合調査、料金仮説、KPI、独立レビュー結果は `reports/` に保存

## 必要環境

- Node.js 22
- npm 11

## セットアップと確認

```bash
npm ci
npm run lint
npm run typecheck
npm run test
npm run build
```

すべてをまとめて実行する場合：

```bash
npm run test:all
```

生成物は `out/` に作成されます。`out/` だけをリポジトリへコミットしないでください。

ローカル開発：

```bash
npm run dev
```

Next.js の basePath が有効なため、表示URLは `http://localhost:3000/osanpo/` です。

本番生成物を `/osanpo/` のパスで確認する場合：

```bash
npm run build
npm run preview
```

表示URLは `http://127.0.0.1:4173/osanpo/` です。

## コンテンツ更新

主なデータは `src/content/site-data.ts` にあります。既存IDはURLとお気に入りデータに使われるため、理由なく変更しないでください。

追加時に必要な共通項目と種類別項目は `src/content/templates.ts` にまとめています。記事を自動生成するものではなく、運営者が確認済みデータを追加するときの型・チェックリストです。

更新時は次を確認します。

1. 公式情報源がある
2. 架空の住所・価格・評価・口コミ・体験談がない
3. 現地取材していない内容を体験談として書いていない
4. AI画像に「イメージ」表示と正しいaltがある
5. 内部リンクと外部リンクが有効
6. `npm run test:all` が成功する
7. `out/sitemap.xml` と生成ページが一致する

Phase 1では既存データを型付きモジュールへ移行しています。全コンテンツへの `ContentVerification` の完全適用、自動取得、期限切れゲートは Phase 2 以降の対象です。

## GA4

初期状態では測定を行いません。架空の測定IDは設定しないでください。

1. `.env.example` を `.env.local` へコピー
2. 実在する測定IDだけを設定

```text
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

`G-`形式でない値や空欄では GA4 を読み込みません。`send_page_view: false` で初期化し、アプリ側がページ表示を1回だけ送信します。

主な実装済みイベント：`page_view`、`course_view`、`area_view`、`spot_view`、`story_view`、`related_content_click`、`plan_start`、`plan_condition_change`、`plan_result_view`、`plan_course_click`、`google_map_click`、`walking_route_click`、`house_ad_impression`、`house_ad_click`、`sponsor_impression`、`sponsor_click`、`affiliate_click`、`advertise_view`、`sponsor_contact_click`、`business_cta_click`、`contact_form_open`。

個人情報、生の検索語、メールアドレス、問い合わせ本文、外部URL全文は送信しません。`page_location` からもクエリ文字列とハッシュを除外します。

## 問い合わせ・広告・アフィリエイト

- 問い合わせ先：公開Googleフォームと補助メールを設定済み
- スポンサー相談：事業者向けページから同じGoogleフォームへ案内
- House Ad（自社の「広告掲載・スポンサー募集」枠）：6 placementで表示
- 実スポンサー、アフィリエイトリンク、AdSense実広告：0件
- AdSense publisher ID、slot ID：未設定（scriptは読み込みません）

広告基盤は `src/content/monetization.ts` の1か所で管理します。表示優先度は「有効な直接スポンサー → affiliate → 承認・同意設定済みAdSense → House Ad → 非表示」です。現在のplacementは次の7つです。

- `home-after-courses`：House Ad ON
- `courses-after-grid`：House Ad ON
- `course-detail-after-info`：House Ad ON
- `area-detail-after-courses`：House Ad ON
- `spot-detail-end`：House Ad ON
- `story-middle`：House Ad OFF（長い記事の実広告・スポンサー用）
- `story-end`：House Ad ON

### 後から実広告へ差し替える手順

1. 広告主から、実在する広告主名、見出し、説明、リンク先、掲載位置、対象エリア、掲載期間、画像と掲載許可を確認します。
2. `src/content/monetization.ts` の `sponsors` に確認済みデータを追加します。画像を使う場合は `public/assets/` 配下へ置き、altも設定します。
3. `sponsorEnabled` と対象広告の `active` を `true` にします。有効な直接スポンサーがある位置だけ募集枠からスポンサー表示へ自動で差し替わります。サイト全体、各エリア、各コースはそれぞれ1社を上限とします。
4. `npm run test:all` で期間、対象エリア、リンク、スマホ表示、アクセシビリティを確認してから公開します。

契約前の広告、架空の広告主、未確認のリンクは追加しません。終了日を過ぎたスポンサーや `active: false` のスポンサーは表示せず、募集枠へ戻します。

スポンサーはエリアと掲載期間を照合し、静的ビルド時に期間内のものだけを書き出します。公開後に期限を過ぎた表示はブラウザ側でも除外します。開始時は必ず設定変更後に再ビルド・公開し、終了時も次回ビルドでデータを整理してください。表示された場合だけIntersectionObserverで50%以上の表示を確認し、GA4が有効なら種別別のimpressionを送ります。House Adは `house_ad_impression` と `house_ad_click`、スポンサーは `sponsor_impression` と `sponsor_click`、affiliateは `ad_impression` と `affiliate_click` を使用します。外部URL全文や個人情報は送りません。

AdSenseはレスポンシブslotとサイト全体で1回だけのscript読み込みに対応済みです。ただし `enabled`、`adsenseEnabled`、対象placement、`adsenseProductionReady`、`adsenseConsentReady` がすべてONで、実在するpublisher IDとslot IDが設定された場合だけ有効になります。未承認・未設定・no-fill・script失敗時はHouse Adへ戻し、AdSense内部のクリックを独自計測しません。Auto Adsは使用しません。架空の広告主、料金、アクセス数、収益実績は表示しません。

AdSense開始前に、アカウント審査、Privacy & messaging、必要なconsent、ポリシー、広告配置を運営者が確認してください。`ads.txt` はpublisher ID取得後にAdSenseの指定内容で用意します。このサイトは `/osanpo/` 配下のプロジェクトPagesのため、ルートドメイン要件を満たさない `/osanpo/ads.txt` を誤って追加しないでください。必要な公開先を確認してから、ルートの `https://nobuja0428.github.io/ads.txt` または将来の独自ドメインで対応します。

## GitHub Actions

`.github/workflows/ci.yml` は pull request、main、`codex/**` で次を実行します。

- `npm ci`
- ESLint
- TypeScript
- 単体テスト
- 静的ビルド
- `/osanpo/` と主要生成ページの検査
- 旧サイト識別子の残存検査

`.github/workflows/deploy-pages.yml` は main への push または手動実行時だけ、テスト成功後の `out/` を GitHub Pages へ公開します。

本番公開前に GitHub の Settings → Pages → Source を「GitHub Actions」に設定してください。

## 未設定の外部サービス

- GA4測定ID
- Google Search Console
- アフィリエイト提供元
- 公式RSS・API・オープンデータの自動取得

秘密鍵やAPIキーはコードへ直接書かず、必要になった Phase で GitHub Secrets を使用します。

## ロールバック

Phase 1 の基準：

- 作業ブランチ：`codex/phase1-foundation`
- 移行元 main：`811f8a62c41cf6fb916c7f59d9e29e7050a03cd5`

公開前のロールバックは作業ブランチを破棄するだけで完了します。公開後は、直前の正常コミットを revert して Actions を再実行します。GitHub Pages の設定や main を直接書き換えず、必ず pull request の差分と CI を確認してください。

## 参考コードについて

要件で指定された参考ZIPは今回の添付データに存在しなかったため、Phase 1では既存サイトのコンテンツと要件仕様を基に構築しています。ZIPが提供された場合は、コンポーネント、データモデル、テスト、Actionsを再監査し、安全に再利用できる部分だけを取り込みます。
