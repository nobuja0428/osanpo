# コンテンツ・画像品質レポート

## 判定

- 画像数：20点
- 形式：すべてWebP
- 色空間：すべてsRGB
- 作業前後のSHA-256：`scripts/image-sha256.json`と全件一致
- 今回の画像生成・加工・再圧縮・差し替え・改名：なし
- 掲載画像：AI生成画像を含むイメージ素材。実在する街並み、店舗、施設、イベントの記録写真として扱わない

## 画像一覧

| 用途 | ファイル | 寸法 | 容量 | 色空間 |
|---|---|---:|---:|---|
| トップ | `assets/images/hero/hero-tokyo-walk.webp` | 1600×900 | 289,812 B | sRGB |
| エリア・浅草 | `assets/images/areas/area-asakusa.webp` | 1200×800 | 219,412 B | sRGB |
| エリア・吉祥寺 | `assets/images/areas/area-kichijoji.webp` | 1200×800 | 255,366 B | sRGB |
| エリア・高円寺 | `assets/images/areas/area-koenji.webp` | 1200×800 | 212,916 B | sRGB |
| コース・浅草 | `assets/images/courses/course-asakusa.webp` | 1200×900 | 195,198 B | sRGB |
| コース・吉祥寺 | `assets/images/courses/course-kichijoji.webp` | 1200×900 | 237,374 B | sRGB |
| コース・高円寺 | `assets/images/courses/course-koenji.webp` | 1200×900 | 197,048 B | sRGB |
| イベント・神楽坂 | `assets/images/events/event-kagurazaka-festival.webp` | 1200×900 | 99,132 B | sRGB |
| イベント・小金井 | `assets/images/events/event-koganei-awaodori.webp` | 1200×900 | 92,788 B | sRGB |
| イベント・新宿 | `assets/images/events/event-shinjuku-eisa.webp` | 1200×900 | 107,444 B | sRGB |
| イベント・隅田川 | `assets/images/events/event-sumidagawa-fireworks.webp` | 1200×900 | 137,644 B | sRGB |
| スポット・井の頭 | `assets/images/spots/spot-inokashira-park.webp` | 1200×900 | 236,042 B | sRGB |
| スポット・かっぱ橋 | `assets/images/spots/spot-kappabashi.webp` | 1200×900 | 107,840 B | sRGB |
| スポット・吉祥寺美術館 | `assets/images/spots/spot-kichijoji-art-museum.webp` | 1200×900 | 142,610 B | sRGB |
| スポット・高円寺氷川神社 | `assets/images/spots/spot-koenji-hikawa.webp` | 1200×900 | 388,932 B | sRGB |
| スポット・高円寺純情商店街 | `assets/images/spots/spot-koenji-junjo.webp` | 1200×900 | 197,334 B | sRGB |
| スポット・浅草寺 | `assets/images/spots/spot-sensoji.webp` | 1200×900 | 196,146 B | sRGB |
| 読み物・浅草 | `assets/images/stories/story-asakusa-first-hour.webp` | 1200×900 | 187,160 B | sRGB |
| 読み物・井の頭 | `assets/images/stories/story-inokashira-short-walk.webp` | 1200×900 | 230,344 B | sRGB |
| 読み物・高円寺 | `assets/images/stories/story-koenji-shopping-streets.webp` | 1200×900 | 187,918 B | sRGB |

## 使い分け

- エリア画像：街全体の雰囲気を伝える一覧・エリア詳細・エリアOGP
- コース画像：STARTからGOALまでの散歩体験を伝えるコース一覧・詳細・OGP
- スポット画像：個別の立ち寄り対象を示すスポット一覧・詳細・OGP
- 読み物画像：記事の視点やテーマを示す読み物一覧・詳細・OGP
- イベント画像：過去イベントを含むイベント一覧
- ヒーロー画像：トップと、固有画像を持たない案内ページのOGP

## 近似重複候補

32×32pxへ正規化した画像差分の小さい組み合わせです。完全な同一ファイルではありませんが、検索結果やSNSカードで並んだ場合に区別が弱くなる可能性があります。

1. `course-asakusa.webp` と `spot-sensoji.webp`
2. `course-asakusa.webp` と `story-asakusa-first-hour.webp`
3. `spot-sensoji.webp` と `story-asakusa-first-hour.webp`
4. `spot-inokashira-park.webp` と `story-inokashira-short-walk.webp`
5. `course-koenji.webp` と `story-koenji-shopping-streets.webp`
6. `course-kichijoji.webp` と `story-inokashira-short-walk.webp`

## 将来の差し替え推奨

- 現地取材を実施した後、エリア詳細は街の入口が分かる実景写真へ差し替える
- コース詳細はSTART・途中・GOALの関係が伝わる現地写真または正確な地図表現を検討する
- スポット詳細は施設管理者の利用条件を確認した公式写真または現地撮影写真を使用する
- 読み物はコース・スポット画像と構図が重ならないテーマ画像へ分ける
- イベント画像は主催者の利用許諾を確認できた公式素材がある場合だけ差し替える

差し替え時は、利用権限、撮影日、被写体の個人情報、実景との一致、alt、寸法、容量、OGP表示を再確認します。
