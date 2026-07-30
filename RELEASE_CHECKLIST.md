# 公開V1 リリースチェックリスト

`[x]`は今回の作業環境で実際に確認した項目です。外部サービス、実機、現地確認は完了扱いにしていません。

## 設定・生成

- [x] 正式公開URL：`https://nobuja0428.github.io/osanpo/`
- [x] basePath：`/osanpo/`
- [x] GA4初期状態：無効・測定ID空欄
- [x] 問い合わせ：フォーム・メール空欄
- [x] `node scripts/build-static.mjs`
- [x] 28クリーンURLの実体HTML
- [x] 2回生成して差分なし
- [x] `node scripts/check-site.mjs`

## HTML・SEO

- [x] JavaScriptなしでも主要本文あり
- [x] 各ページのtitle
- [x] 各ページのdescription
- [x] 各ページのcanonical
- [x] ページ固有OGP
- [x] Twitter Card
- [x] WebPage構造化データ
- [x] BreadcrumbList構造化データ
- [x] トップのWebSite・Organization
- [x] 構造化データのJSON構文
- [x] `sitemap.xml`と実体ファイル一致
- [x] sitemapにハッシュ・404・検索・お気に入りなし
- [x] `robots.txt`のSitemap URL
- [x] 404のnoindex
- [x] 検索・お気に入り・SPA内404のnoindex処理

## リンク・画像

- [x] 内部リンクの実体ファイル
- [x] 空hrefなし
- [x] `javascript:` URLなし
- [x] 画像パス
- [x] 画像20点
- [x] 画像SHA-256不変
- [x] READMEへの一般利用者向けリンクなし
- [x] 旧ハッシュURL対応表
- [x] 404から`/osanpo/`へ復帰
- [x] 404の無条件転送なし
- [ ] 外部リンクの遷移先をインターネット上で再確認

## 計測・プライバシー

- [x] 解析OFF時にGA4を読み込まない
- [x] 有効なGA4モック
- [x] `send_page_view: false`
- [x] 同一page_viewの二重送信防止
- [x] SPAイベント名を維持
- [x] 静的ページの閲覧・外部リンク計測
- [x] 生の検索語を送らない
- [x] 個人情報・外部URL全文をイベントへ渡さない設計
- [x] GA4無効状態とプライバシー表示の一致
- [ ] Cookie同意要否を運営者・法務で確認

## 問い合わせ・広告掲載

- [x] 未設定時は準備中表示
- [x] 未設定時にフォーム・送信ボタン・架空連絡先なし
- [x] GoogleフォームURL検証処理
- [x] 公開用メール検証処理
- [x] 設定時だけ問い合わせ方法を生成
- [x] 広告掲載は募集予定・相談準備中・媒体資料準備中・実績蓄積中
- [x] 架空料金・実績・広告主なし

## 機能・アクセシビリティ

- [x] 既存`localStorage`キー維持
- [x] お気に入りの追加・削除・再読込モック
- [x] 検索・絞り込みの既存SPA処理を維持
- [x] 実用情報順：電車→食事・休憩→トイレ
- [x] イベント0件時はヘッダー主要ナビから非表示
- [x] イベントページ・フッターから過去情報へ到達
- [x] `lang="ja"`
- [x] 各静的ページのh1は1つ
- [x] パンくず
- [x] スキップリンク処理
- [x] `aria-current`
- [x] フォーカス表示
- [x] `prefers-reduced-motion`
- [ ] 1440px実ブラウザ
- [ ] 1024px実ブラウザ
- [ ] 768px実ブラウザ
- [ ] 375px実ブラウザ
- [ ] 320px相当の実ブラウザ
- [ ] 200％拡大の実ブラウザ
- [ ] キーボード操作の実ブラウザ

## HTTP・構文・安全性

- [x] 28ルートをローカルHTTPで200確認
- [x] 存在しないルートをHTTP 404で確認
- [x] JavaScript・MJS構文
- [x] CSS波括弧
- [x] `git diff --check`
- [x] APIキーらしき文字列なし
- [x] トークンらしき文字列なし
- [x] 個人メールなし
- [x] ローカル絶対パスなし
- [x] `.env`・`node_modules`を成果物に含めない設計

## 外部作業

- [ ] GA4測定ID
- [ ] GA4リアルタイム
- [ ] Googleフォーム
- [ ] 公開用メール
- [ ] Google Search Console
- [ ] 所有権確認
- [ ] `sitemap.xml`送信
- [ ] iPhone実機
- [ ] Android実機
- [ ] 現地取材
- [ ] 最新イベント
- [ ] Cookie同意要否
- [ ] 店舗営業
- [ ] 掲載プラン
