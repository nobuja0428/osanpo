# おさんぽクラブ東京 — GitHub Pages版

公開中の「おさんぽクラブ」の構成を参考に、GitHub Pagesへ置きやすい静的SPAとして作成したコードです。

## 主な機能

- トップページ
- エリア一覧・詳細
- 散歩コース一覧・詳細
- スポット記事
- 街の読み物
- 掲載イベント情報（開催状態を日時から判定し、終了分は過去欄へ移動）
- Googleマップ埋め込み・ルートリンク
- お問い合わせ（メール・外部フォーム未設定時は準備中表示）
- スマートフォン対応
- ハッシュルーティングによるGitHub Pages対応

## ローカルで確認

依存パッケージはありません。

```bash
python -m http.server 8000
```

ブラウザで `http://localhost:8000` を開きます。

## GitHub Pagesで公開

1. このフォルダーをGitHubリポジトリへアップロード
2. GitHubの `Settings` → `Pages`
3. `Deploy from a branch` を選択
4. `main` ブランチの `/ (root)` を指定
5. 表示されたURLへアクセス

## 連絡先の設定

`config.js` を編集します。

```js
window.OSANPO_CONFIG = {
  contactEmail: "",
  contactFormUrl: "",
};
```

公開用アドレスが決まった場合だけ `contactEmail` に設定してください。Googleフォームを使う場合は `contactFormUrl` に公開URLを設定してください。空欄の間は準備中表示になります。

## 画像の差し替え

`data.js` の `images` を差し替えてください。現在は構成確認用の外部画像を使用しています。本番公開前に、利用権を確認した写真または制作したAI生成画像へ差し替えることを推奨します。

```js
images: {
  koenji: "assets/images/koenji.webp",
}
```

画像は `assets/images` に配置し、WebPまたはAVIFを推奨します。

## イベントの更新

`data.js` の `events` に追加します。`end` を過ぎたイベントはトップから非表示になり、イベントページの過去欄へ移動します。

イベントは手動更新です。自動取得や中止・延期の自動反映は実装していません。`informationCheckedAt`、`lastUpdated`、`officialUrl`を更新し、中止・延期時は`status`へ明示してください。

## Googleマップ

APIキーなしで使えるGoogleマップ検索埋め込みと、GoogleマップのルートURLを利用しています。高度なピン連動やルート描画を行う場合は、Google Maps JavaScript APIの契約・APIキー設定が必要です。

## 注意

- 店舗・施設・イベントの情報は公式情報を確認して更新してください。
- 外部画像のライセンスを本番公開前に確認してください。
- AI画像を実在店舗の記録写真として表示しないでください。
- 現在のエリアデータは高円寺・吉祥寺・浅草の3件です。残り37エリアのページや記事は、確認済み情報が用意できるまで追加しません。
