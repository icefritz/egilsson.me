# Tasks

## 1. 検索欄とボタンを一体の角丸4pxの枠にする

- [x] 1.1 `utilities/index.html` の `form` を `align-items:stretch`、`min-height:44px`、`border-radius:4px`、`overflow:hidden`、左だけ14pxの padding にする。虫眼鏡の svg は中央に置く
- [x] 1.2 `button` を `border-radius:0`、`min-height:44px`、`padding:0 20px` にし、768px 以下の `padding:0 14px` も合わせる。390×844 と 1440×900 で、欄とボタンが同じ高さで連結していることを確認する

## 2. 「Back」の押せる高さを 44px 以上にする

- [x] 2.1 `assets/site.css` の `.back` の padding を `10px 0`、margin-bottom を 14px にする。ユーティリティとチェックリストの両方で高さを確認する

## 3. 見出しの金色の角型を消す

- [x] 3.1 `h2::before` を削除する。見出しは灰色の小さな文字のまま、罫線で区切る

## 4. サービス名を 13px にする

- [x] 4.1 `.grid span` の font-size を 13px にする

## 5. 行き先のホスト名を表示する

- [x] 5.1 各リンクの2行目を、行き先のホスト名にする（whatbox.ca、sonarr.egilsson.me、radarr.egilsson.me、bazarr.egilsson.me、prowlarr.egilsson.me、qbittorrent.egilsson.me、app.plex.tv）

## 6. 空の検索を送れないようにする

- [x] 6.1 検索欄の `input` に `required` を付ける。空のまま送信すると、ブラウザが入力を求めることを確認する

## 7. 一覧の幅を 640px にする

- [x] 7.1 `main` を `page narrow` にする。1440×900 で、行の幅が 640px に収まることを確認する

## 8. 確認

- [ ] 8.1 （ユーザーが実行）`/utilities/` と `/checklist/` を 390×844、360×740、1440×900 で開き、崩れや横スクロールがないこと、Back の押しやすさ、検索の送信を確認する
- [ ] 8.2 （ユーザーが実行）`/ui-review --verify ui-refine-utilities` で Before/After を確認する。実装担当はこのタスクにチェックを付けない
