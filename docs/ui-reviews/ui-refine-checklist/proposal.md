# Proposal

## Why

チェックリストは夜勤中に片手で使う画面だが、未完了の項目が1件ずつ箱に入り、条件がアクセント色のチップになり、件数が小さく、「今の作業」が画面の下にあるため、初めて開いたときに今何をすべきかが分かりにくい。タップ領域も小さい（「Show N done」27px、Reset 36px）。

## What Changes

- 項目を箱ではなく、行の下に1pxの罫線で区切る（参考: yr.no の日別表。行を区切り、カードを使わない）。
- 「Show N done」と Reset の高さを 44px 以上にする（見た目の大きさは変えない。根拠: WCAG 2.5.8）。
- 条件（If needed など）は、アクセント色のチップと破線をやめ、小さな灰色の文字にする（方針: アクセント色は現在地とリンクに限る）。
- 件数を大きな数字で示し、残りの件数を同じ行に出す。バーは細くする。
- 「今の作業（Now）」を、件数の下に「Now · セクション名 · 残り N →」の1行で出し、押すとそのセクションへ移動する（参考: Things 3 の This Evening の区切り）。
- 補助テキスト（時刻・見出しの件数・eyebrow）を 13px 以上にそろえる。
- 「Tick a task…」の説明は初回だけ表示し、以後は隠す（オフライン時の警告は常に表示）。
- 完了済みの一覧を開いたとき、「Tap an item to put it back.」を文字で表示する（タッチ端末でも見える）。
- 見出し横の状態表示を統一する（「Now」は pill のまま、残り件数と「All done」は右端の小さな文字）。
- Reset を文字だけのボタンにし、二段階の確認は残す。

データと同期の仕組み（保存される値、Google Apps Script への書き込み、shift の切り替え）は変えない。行の高さの不揃い（F10）と、パソコンでの中央寄せ（F12）は変えない。

## Impact

- 変えるファイル: `checklist/index.html`（ページ内の CSS と、描画・初回表示の JS）。
- 追加する localStorage のキー: `nightshift-note-seen`（説明文を見せたかどうか。状態のキー `nightshift-state` とは別）。
- 影響する他画面: なし（この画面だけ）。
- テスト: 静的サイトのためテストはない。見た目は 390×844、360×740、1440×900 で確認する。
- 検証: `/ui-review --verify ui-refine-checklist` の Before/After スクショと実機で確認する。
- 参考スクショ: `screenshots/before-checklist-mobile.png`、`screenshots/before-checklist-desktop.png`、`screenshots/before-done-open-mobile.png`（after は `screenshots/after-checklist-*.png`）
