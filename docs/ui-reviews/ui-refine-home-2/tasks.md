# Tasks

## 1. ロケーションメニューを面1つにする

- [x] 1.1 `index.html` の `.wx-menu` に背景・枠・角丸 8px・影・上下 4px の padding を付け、`gap` を 0 にする
- [x] 1.2 `.wx-menu button` の枠と影を外し、`border-top:1px solid var(--line)` にする。先頭の項目は `border-top:0`。`min-height:44px`、padding `12px 14px`
- [x] 1.3 hover と focus は背景を `var(--surface2)` にする。デスクトップでメニューを開き、天気の見出しに重ならないことを確認する

## 2. 地点を変える入口の当たり判定を広げる

- [x] 2.1 `.dot` に `padding:14px 16px` と、同じ分の負の margin を付ける（見た目は変えない）

## 3. 補助テキストを 13px にする

- [x] 3.1 `.wx-h small`・`.wx-h span`・`.wx-dn small`・`.wx-wind`・`.wx-menu small` を 13px にする

## 4. 既定の表示を灰色の文字にする

- [x] 4.1 `assets/weather.js` の既定の表示を `(default)` にし、`.wx-mn em` を灰色 13px・バッジなしにする

## 5. スマホの上下の余白を減らす

- [x] 5.1 `@media (max-width:560px)` で `.hero` の padding-block を 24px にする。390×844 と 360×740 で、Checklist の行が画面内に入ることを確認する

## 6. 天気の見出しと末尾を分ける

- [x] 6.1 `assets/weather.js` の見出しを地点名と観測所だけにする。「Measured 時刻 · vedur.is」を `<p class="wx-foot">` として天気カードの最下段に置く（`.wx-foot` の CSS を追加）

## 7. 風の単位とスマホの日別の風

- [x] 7.1 時間別の風に `m/s` を付ける
- [x] 7.2 スマホでも `.wx-wind` を表示する。日別の列に6つ目の列（56px）を足す

## 8. 確認

- [ ] 8.1 （ユーザーが実行）`/` を 390×844、360×740、1440×900 で開き、地点を切り替えて表示が崩れないことを確認する。天気の見出しと末尾の線が本来の幅で出ているかも確認する
- [ ] 8.2 （ユーザーが実行）`/ui-review --verify ui-refine-home-2` で Before/After を確認する。実装担当はこのタスクにチェックを付けない

## 9. 既知の小さな点

- [x] 9.1 天気カードの末尾の区切り線が、日別の行より短く見えた（検証で確認）。`.wx-foot` に `max-width:none` を付けて解消

## 10. 検証で出た修正

- [x] 10.1 スマホで Checklist の行が画面外に 11px（390）と 2px（360）はみ出していた。`@media (max-width:560px)` で `.wx-hours` の上下の余白と `.wx-foot` の上の余白を縮め、390×844 で行の下端 843px、360×740 で 733px に収めた（ブラウザで計測）
- [ ] 10.2 （ユーザーが実行）スクショ（`screenshots/after-*.png`）は修正の前に撮ったもの。修正後の見た目を確認する
