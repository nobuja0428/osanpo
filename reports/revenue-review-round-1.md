# 収益化アップデート独立レビュー Round 1

- 対象：codex/revenue-growth-v1
- 実施日：2026-08-14
- 方針：レビュー担当はコードを変更せず、主担当が指摘を修正した。

## Reviewer 1：収益モデル・公式根拠・広告運用

- Critical 0 / Major 3 / Minor 4
- Major：必須レポートがGit管理外、House Adの直接相談がスポンサーKPIに未計上、本番広告在庫に対する上限・期限検査が品質ゲートに未接続。
- 対応：必須MarkdownだけをGit対象化。直接相談に sponsor_contact_click を追加。本番在庫JSONと共通validatorを品質ゲートから検査。
- Minor：aumoの未確認収益モデル表現と内部料金仮説の差を修正。将来運用項目はbacklogへ記録。

## Reviewer 2：SEO・コンテンツ

- Critical 0 / Major 5 / Minor 1
- Major：同一結果集合の条件LP、一般詳細のBreadcrumb JSON-LD不足、イベント回遊不足、期限切れイベントの索引方針不整合、生成HTMLを見ない品質ゲート。
- 対応：条件LPを固有集合の2ページに限定。一般詳細へページ種別＋Breadcrumb、条件LPへItemListを追加。既存エリア名と厳密に一致するイベントだけ周辺導線を表示。期限切れイベントをnoindex/follow化。生成HTML検査を拡張。
- Minor：sitemapも該当コース2件以上を再判定。

## Reviewer 3：UX・アクセシビリティ

- Critical 1 / Major 4 / Minor 4
- Critical：共通validatorの型宣言解決失敗。d.mtsを追加しtypecheck成功を確認。
- Major：診断のhydration競合、質問・結果のフォーカス喪失、キーワード入力ごとの履歴追加、低コントラストのフォーカスリング。
- 対応：no-JS表示をhydrationと競合しないCSSのscripting条件へ変更。見出しへフォーカス移動とlive通知を追加。入力中はreplaceState。濃緑＋白の二重フォーカスリングへ変更。
- Minor：結果CTAを44pxへ修正。地図タブ、お気に入り初期表示、重複地図CTAはbacklogへ記録。

## Reviewer 4：技術品質・回帰

- Critical 0 / Major 2 / Minor 3
- Major：Affiliateのcontent関連性ガード不足、スポンサーscope契約のvalidator不足。
- 対応：AffiliateをcontentId一致必須化。scopeType、対象ID、placement、HTTPS、期間、ID重複を共通validatorで検査。
- Minor：スポンサーの重複predicateを削除、event integrityを期限データ連動、JSON-LDの小なり記号をescape。
