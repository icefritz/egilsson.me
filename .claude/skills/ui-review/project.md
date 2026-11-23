# /ui-review のプロジェクト設定

<!-- status: configured -->

このファイルは `/ui-review` を初めて実行したときに、リポジトリを調べて自動で埋められる。
手で直してもよい。`status` が `unconfigured` のあいだは、/ui-review は最初にこのファイルの設定を行う。

## アプリの概要

- 何のアプリか: 個人サイト egilsson.me。サイドプロジェクトの入口（ホーム）、ユーティリティのリンク集、夜勤用チェックリスト（PWA）
- 主な利用者と使い方: サイトの持ち主本人。スマホやPCで開き、ホームでアークレイリ等の天気（vedur.is）を見て、各ツールへ移動する
- 主な対象の画面幅: 両方（ホームは 1000px 以上で2カラムのグリッドに切り替わる。チェックリストはスマホ中心）

## 技術スタック

- フレームワーク: なし（静的 HTML、ビルドなし）
- ルーター: なし（ディレクトリごとの index.html）
- スタイリング: 素の CSS。共通は assets/site.css、各ページの `<style>` にページ固有の CSS
- デザイントークンの場所: assets/site.css の :root（--bg, --surface, --accent, --f-display など）
- アイコン: インライン SVG（ストローク型、手書き）
- ダークモード: ダーク固定（`color-scheme: dark`）

## dev サーバー

- 起動コマンド: npx serve -l 3000 .
- ベースURL: http://localhost:3000/
- 起動確認: curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/ が 200
- ハッシュルーター: いいえ

## ビューポート

撮影するビューポート。1つ目を主とする。

| 名前      | 幅×高さ  | 用途                                  |
| --------- | -------- | ------------------------------------- |
| mobile    | 390×844  | 主                                    |
| mobile-sm | 360×740  | はみ出し確認                          |
| desktop   | 1440×900 | ホーム（2カラム）・ユーティリティ |

## 画面一覧

| 画面名（引数で受け付ける名前） | URL | 主なファイル | spec の capability（OpenSpec を使う場合） | change 名 |
| ------------------------------ | --- | ------------ | ----------------------------------------- | --------- |
| ホーム / home | http://localhost:3000/ | index.html, assets/weather.js, assets/site.css | - | ui-refine-home |
| ユーティリティ / utilities | http://localhost:3000/utilities/ | utilities/index.html, assets/site.css | - | ui-refine-utilities |
| チェックリスト / checklist | http://localhost:3000/checklist/ | checklist/index.html, assets/site.css | - | ui-refine-checklist |

## データの準備

- 方法: なし。ホームの天気は撮影時に vedur.is から実データを取得する（失敗時はエラー表示になる）。チェックリストの状態は撮影用ブラウザの localStorage だけに入る
- 手順: 天気の読み込み完了（`#weather` の `aria-busy` が外れる）を待ってから撮影する
- 注意: 利用者の本番データには触れない方法に限る。

## 変更の起票先

- OpenSpec: 使わない
  - 使わない場合: `docs/ui-reviews/ui-refine-<画面>/` に proposal.md / tasks.md / screenshots/ を書き出す。
- テスト・lint のコマンド: なし（静的サイト。ローカルサーバーで目視確認）
