# Proposal

## Why

ホームは、名前・天気・導線の3つが同じ強さの箱で並び、AIが作った定型の見た目に見える。特に次の2点が利用者の妨げになっている。

- スマホ（390×844）では、天気の日別と時間別で縦に約655px使い、Utilities と Checklist の導線が初期表示の外に出る。ホームを開く目的は各ツールへの移動なのに、それが見えるまでスクロールが必要になる。
- 導線と天気の面がグラデーションとわずかな角丸・枠で箱になり、ホバーで浮き、アイコンの色タイルが見出しと意味を重ねている。どこが操作できるかは分かるが、情報の価値は上がっていない。

## What Changes

- **スマホの天気を4日に減らす**（参考: yr.no Akureyri 日別表。日別の行を並べ、情報量を抑える）。`max-width: 560px` で5日目以降の `.wx-d` を非表示にし、導線を初期表示に入れる。
- **導線を素のリストにする**（参考: GOV.UK トップの素の箇条書きリンク。アイコンや枠で囲まない）。`nav a` の枠・グラデ・角丸・`.ic` タイルを外し、行を1pxの罫線で区切る。ホームと Utilities（`.grid a`）の両方を揃える。
- **hover で要素を浮かせず、枠色の変化だけにする**。`transform: translateY(-2px)` を外し、`border-color` の変化を残す。ホームと Utilities の両方。
- **面を単色にする**。天気パネル（`.wx`）、導線、場所メニューのボタンのグラデーションを `var(--surface)` の単色にし、塊の角丸を8px以下にする。ホームと Utilities の両方。
- **天気の棒とアイコンの色を止める**。日別の棒（`.wx-bar i`）は単色の `var(--muted)`、天気アイコン（`.wi`）は `var(--fg2)` にする。ブランド色は現在値とリンクに残す。
- **スマホの日付を1行に収める**（参考: yr.no の日別表。各行の見出しは1行で並ぶ）。`.wx-d` の日付列を76pxにし、`.wx-dn` に `white-space: nowrap` を付ける。

データや操作（保存される値、画面遷移、天気の取得元）は変えない。

## Impact

- 変えるファイル: `index.html`（インラインの `<style>` と nav の HTML の一部）、`utilities/index.html`（`.grid a` とそのグラデ・枠）。天気の描画（`assets/weather.js`）と共通トークン（`assets/site.css` の `:root`）は変えない。
- 影響する他画面: Utilities（導線の見た目と hover、面の単色化）。Checklist は変えない（この change の対象外）。
- テスト: 静的サイトのためテストはない。見た目の期待値は、スマホ390×844・360×740、デスクトップ1440×900で確認する。
- 検証: `/ui-review --verify ui-refine-home` の Before/After スクショと実機で確認する。
- 参考スクショ: `screenshots/before-home-mobile.png`、`screenshots/before-home-desktop.png`（フルページは `before-full-home-*.png`）
