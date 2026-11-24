# Proposal

## Why

ユーティリティは、検索とサーバーへのリンクを並べた画面。見た目は落ち着いているが、検索欄とボタンだけが強い丸みを持ち、押すボタンが44px未満、補助テキストが12px、見出しの前に意味のない金色の角型がある。リンクは全部別タブで開くのに、行き先が見えないため、押した先が分からない。検索欄は空のまま送信でき、デスクトップでは行が848pxに広がって右側が空く。

## What Changes

- 検索欄とボタンを、角丸4pxの同じ高さの一体の枠にする（参考: Wikipedia の検索欄。角の小さい長方形で、ボタンが右端に連結）。
- 検索ボタンの高さを 44px 以上にする。
- 画面上部の「Back」の押せる高さを 44px 以上にする（共通の `assets/site.css` の `.back`。チェックリストにも効く）。
- 見出し「PLEX SERVER」の前の金色の角型を消す。区切りは罫線で示す（参考: Hacker News の文字だけの一覧）。
- 各リンクの2行目（サービス名）を 13px にする。
- 2行目を、行き先のホスト名（例: sonarr.egilsson.me）にする。行き先と新しいタブで開くことが分かるようにする（参考: Hacker News の灰色のドメイン表示）。
- 検索欄に `required` を付け、空のまま送信できないようにする。
- 一覧の幅を 640px に制限する（既存の `page narrow` クラス）。

データや操作（検索の送信先、リンク先）は変えない。

## Impact

- 変えるファイル: `utilities/index.html`（ページ内の CSS、マークアップ）、`assets/site.css`（`.back` の余白。共通）。
- 影響する他画面: チェックリスト（`.back` の高さが 37px→約45px、上下の余白が少し増える）。
- テスト: 静的サイトのためテストはない。見た目は 390×844、360×740、1440×900 で確認する。
- 検証: `/ui-review --verify ui-refine-utilities` の Before/After スクショと実機で確認する。
- 参考スクショ: `screenshots/before-utilities-mobile.png`、`screenshots/before-utilities-desktop.png`、`screenshots/before-focus-search-mobile.png`（after は `screenshots/after-utilities-*.png`）
