# Tasks

## 1. スマホの天気を4日に減らす

- [ ] 1.1 `index.html` の `<style>` に `@media (max-width:560px){ .wx-d:nth-child(n+5){display:none} }` を足す。開発者ツールで 390×844 にして、導線（Utilities と Checklist）が初期表示に入ることを確認する。360×740 は 8. の修正で扱う

## 2. 導線を素のリストにする

- [ ] 2.1 `index.html` の `nav` を `flex-direction:column` にし、`max-width:none` にする。`nav a` の枠・グラデ・角丸・padding を外し、`padding:14px 0` と `border-bottom:1px solid var(--line)` にする。`.ic` タイルの要素と CSS を削除する。タイトルは `var(--f-display)`、説明は `var(--muted)`、`.go` は右端に置く。1440×900 と 390×844 で罫線と文字の揃いを確認する
- [ ] 2.2 `utilities/index.html` の `.grid a`（29〜31行付近）も同じ構成に揃える。`.grid` の列とカードの枠を外し、罫線区切りにする。1440×900 と 390×844 で確認する

## 3. hover で要素を浮かせない

- [ ] 3.1 `index.html` の `nav a:hover` から `transform:translateY(-2px)` を外し、`border-color` の変化だけにする。`transition` から `transform` を外す
- [ ] 3.2 `utilities/index.html` の `.grid a:hover`（30行付近）も同じにする。デスクトップでカーソルを合わせ、動かず枠色だけ変わることを確認する

## 4. 面を単色にし、塊の角丸を8pxにする

- [ ] 4.1 `index.html` の `.wx`（52行付近）の `background` を `var(--surface)` の単色にし、`border-radius` を8pxにする。`nav a` のグラデも `var(--surface)` にする（導線は 2.1 で枠を外すので、背景は付けない）。場所メニューの `.wx-menu button`（30行付近）のグラデを `var(--surface)` にする。影（`.wx-menu button` の box-shadow）は残す
- [ ] 4.2 `utilities/index.html` の `.grid a`（29行付近）は 2.2 で背景を外しているので、追加の変更はない。1440×900 で確認する（`.feat` の記述は該当するクラスが無いため削除）

## 5. 天気の棒とアイコンの色を止める

- [ ] 5.1 `index.html` の `.wx-bar i`（76行付近）の `background` を `var(--muted)` の単色にする
- [ ] 5.2 `index.html` の `.wi`（58行付近）の `color` を `var(--fg2)` にする。`.wi-big` も同じ。ブランド色（`var(--accent)`）は `.dot` と `.wx a`（vedur.is のリンク）に残す。1440×900 で、天気の列の色が落ち着いたことを確認する

## 6. スマホの日付を1行に収める

- [ ] 6.1 `index.html` の `@media (max-width:560px)`（79行付近）で `.wx-d` の列を `76px 22px 30px 1fr 30px` にする。`.wx-dn` に `white-space:nowrap` を付ける。390×844 と 360×740 で、全6行（または4行）の高さが揃うことを確認する

## 7. 検証で出た修正

- [ ] 7.1 `index.html` の `<style>` に `@media (max-width:560px) and (max-height:760px){ .wx-h:nth-child(n+5){display:none} }` を足し、時間別を1行（4時間分）にする。360×740 で、Utilities の題名と Checklist の見出しが初期表示に入ることを確認する
- [ ] 7.2 `utilities/index.html` の `.grid a` を `flex-direction:column` にし、`align-items:flex-start` で題名の下に説明を置く。`.grid span` の `margin-left:auto` を外す。1440×900 で、題名と説明が近い位置に並ぶことを確認する（ホームの nav と同じ並び）
- [ ] 7.3 `index.html` の `.wx-menu.m::after` の `opacity:.94` を `opacity:1` にする。390×844 で場所メニューを開き、後ろの天気の文字が透けないことを確認する

## 8. 確認

- [ ] 8.1 （ユーザーが実行）`http://localhost:3000/` と `http://localhost:3000/utilities/` を 390×844、360×740、1440×900 で開き、崩れや横スクロールがないことを確認する。ホバーと場所メニューの開閉も確認する
- [ ] 8.2 （ユーザーが実行）`/ui-review --verify ui-refine-home` で Before/After を確認する。実装担当はこのタスクにチェックを付けない

## 別の change で扱う

- 検索欄とボタンが角丸 999px（丸）。デザイン方針の角丸ルールに当たるなら、別の change で直す（utilities/index.html の `form` と `button`）
