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

実装済みイベント：

- `page_view`
- `search_submit`
- `filter_apply`
- `filter_clear`
- `favorite_change`

個人情報、生のメールアドレス、問い合わせ本文は送信しません。その他の成果イベントは該当機能を実装する Phase で追加します。

## 問い合わせ・広告・アフィリエイト

- 問い合わせ先：未設定
- 広告申込先：未設定
- アフィリエイトリンク：未設定
- AdSenseコード：未設定

未設定の申込ボタン、架空の広告主、料金、アクセス数、収益実績は表示しません。

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
- 公開用メールまたは問い合わせフォーム
- アフィリエイト提供元
- スポンサー申込先
- 公式RSS・API・オープンデータの自動取得

秘密鍵やAPIキーはコードへ直接書かず、必要になった Phase で GitHub Secrets を使用します。

## ロールバック

Phase 1 の基準：

- 作業ブランチ：`codex/phase1-foundation`
- 移行元 main：`811f8a62c41cf6fb916c7f59d9e29e7050a03cd5`

公開前のロールバックは作業ブランチを破棄するだけで完了します。公開後は、直前の正常コミットを revert して Actions を再実行します。GitHub Pages の設定や main を直接書き換えず、必ず pull request の差分と CI を確認してください。

## 参考コードについて

要件で指定された参考ZIPは今回の添付データに存在しなかったため、Phase 1では既存サイトのコンテンツと要件仕様を基に構築しています。ZIPが提供された場合は、コンポーネント、データモデル、テスト、Actionsを再監査し、安全に再利用できる部分だけを取り込みます。
