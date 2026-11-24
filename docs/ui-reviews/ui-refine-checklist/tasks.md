# Tasks

## 1. 項目を罫線で区切る

- [x] 1.1 `checklist/index.html` の `.list` の gap を 0 にし、`.item` の背景・枠を外して `border-bottom:1px solid var(--line)` にする。最後の項目の線は消す。390×844 で箱がなくなっていることを確認する
- [x] 1.2 `.item.cond-item` の破線の枠を削除する

## 2. ボタンの高さを 44px 以上にする

- [x] 2.1 `.toggle`（Show N done）と `.reset` の `min-height` を 44px にする。390×844 で高さを確認する

## 3. 条件を小さな灰色の文字にする

- [x] 3.1 `.when` のアクセント色・背景・角丸を外し、`color:var(--muted)` と 13px にする

## 4. 件数を大きくする

- [x] 4.1 `.count` を `var(--f-display)` の 20px にし、「15/42」と「27 left」を並べる。`.progress` の高さを 6px にする

## 5. 今の作業を上に出す

- [x] 5.1 `#nowlink` を件数の下に置き、現在のセクションがあるときだけ「Now · セクション名 · 残り N →」を出す。押すとそのセクションへ移動する（各 section に id を付けた）

## 6. 補助テキストを 13px 以上にする

- [x] 6.1 `.eyebrow`・`.time`・`.left` を 13px にし、`.pill` を 12px にする

## 7. 説明文は初回だけ

- [x] 7.1 `nightshift-note-seen` を見て、2回目以降は `#note` を隠す。オフライン時の警告は常に表示する

## 8. 完了済みの戻し方を文字で示す

- [x] 8.1 完了済みの一覧を開いたとき、「Tap an item to put it back.」を表示する

## 9. 状態表示をそろえる

- [x] 9.1 「All done」と「N left」を 13px の文字にし、右端に置く。「Now」は pill のまま

## 10. Reset を文字ボタンにする

- [x] 10.1 `.reset` を下線付きの文字ボタンにし、二段階の確認は残す

## 11. 変えないもの

- 行の高さの不揃い（F10）と、パソコンでの中央寄せ（F12）は変えない

## 12. 確認

- [ ] 12.1 （ユーザーが実行）`/checklist/` を 390×844、360×740、1440×900 で開き、項目のタップ、「Show N done」の開閉、Reset の二段階、オフラインの表示を確認する
- [ ] 12.2 （ユーザーが実行）`/ui-review --verify ui-refine-checklist` で Before/After を確認する。実装担当はこのタスクにチェックを付けない
