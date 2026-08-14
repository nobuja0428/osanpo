# 収益KPI計画

- 作成日：2026-08-14
- 目的：90日後に月3万円を目指すための計測設計。達成や収益を保証しない。
- 公開管理画面は作らず、GA4・Search Console・契約台帳の実測値を月次で集計する。

## 基本式

`AdSense推定収益 = 月間PV ÷ 1,000 × Page RPM`

`合計売上 = AdSense実収益 + スポンサー売上 + アフィリエイト売上 + 制作相談売上`

`月3万円までの不足額 = max(0, 30,000円 - 合計売上)`

特定のPage RPM、CTR、成約率は実績がないため置かない。シナリオ計算では、運営者が実測値を入力する。

## KPI定義

| KPI | 計算式・データ源 | 90日で確認すること |
|---|---|---|
| 月間PV | GA4 views | 分母として28日以上を確保 |
| 月間UU | GA4 active users | 重複を除く到達規模 |
| 検索表示回数 | Search Console impressions | 3エリア・条件ページの露出 |
| 検索CTR | clicks ÷ impressions | title/description改善判断 |
| コース詳細到達率 | course_view ÷ page_view | 一覧・診断からの到達 |
| 関連コンテンツCTR | related_content_click ÷ 詳細ページview | 回遊改善 |
| 地図クリック率 | google_map_click ÷ 対象詳細view | 現地行動への移行 |
| 診断開始率 | plan_start ÷ トップview | 主役導線の強さ |
| 診断完了率 | plan_result_view ÷ plan_start | 5問フローの完了 |
| House Ad表示回数 | house_ad_impression | 募集枠の有効露出 |
| House Ad CTR | house_ad_click ÷ house_ad_impression | 広告案内への関心 |
| スポンサー問い合わせ数 | sponsor_contact_clickとGoogleフォーム台帳 | 有効相談数は手動確認 |
| 制作問い合わせ数 | business_cta_clickとGoogleフォーム台帳 | サービス種別別に確認 |
| AdSense Page RPM | AdSense管理画面の実測値 | 承認・同意後のみ使用 |
| AdSense推定収益 | 月間PV ÷ 1,000 × 実測Page RPM | 予測と実収益を混同しない |
| スポンサー売上 | 契約台帳の当月計上額 | 架空契約を含めない |
| アフィリエイト売上 | 提携管理画面の確定額 | 実リンク有効化後のみ |
| 制作相談売上 | 入金・請求台帳の当月計上額 | 問い合わせ数と分ける |
| 合計売上 | 4収益の合計 | 月3万円との差を確認 |

## 月3万円への検証シナリオ

1. スポンサー2社の実契約額を入力する。
2. AdSenseが承認済みなら実測Page RPMで推定収益を計算する。未承認なら0円とする。
3. Affiliateと制作相談は確定売上だけを加える。
4. 不足額を算出し、広告枠を増やさず、回遊・問い合わせ・商品設計のどこを改善するか決める。

例としてスポンサー2社が各7,500円なら15,000円だが、これは内部の算術例であり契約・売上保証ではない。残り15,000円はAdSense、Affiliate、制作相談の実績で埋まるかを検証する。

## 計測上の安全条件

- GA4測定IDが有効な場合だけ送信する。
- 検索語、氏名、メール、電話、問い合わせ本文、Googleフォーム回答、外部URL全文、GoogleマップURL全文を送らない。
- イベントには `page_type`、`content_id`、`area_id`、`placement`、必要な分類値だけを使用する。
- Googleフォームの相談種別はリンク元の `contact_type` と `placement` で区別し、回答内容はGA4へ送らない。
