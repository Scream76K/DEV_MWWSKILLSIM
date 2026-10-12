# 変更一覧

- index.html：LBG Lv1/2の選択・テンプレ・条件UI、P0共通経路、状態JSON/復元、参考ルールDB、0.8の旧APIをDB参照へ。
- bowgun-normal-reference.js：武器別DBルール参照とLBGガード。既存式を共用。
- tests/kan24-lbg-normal.test.cjs：追加3件、各HitMV・0.8一回・HBG維持・範囲外保留。
- tools/kan24-lbg-p0-dom.test.cjs：追加5件、3経路・状態/スキル・条件再計算・保存JSON・比較条件復元。
- tools/kan24-lbg-p0-browser.test.cjs：追加2件、375/1440pxでUI/JSON/保留と画像証跡。
- tests/r221-technique-triage.test.cjs、tests/r222-technique-source-evidence.test.cjs、tests/r51-dual-blades.test.cjs：新参考ルール1件を明示別計上。元件数の厳密検証維持。
- tools/canonical-presets-dom.test.cjs、tools/expanded-combo-dom.test.cjs：LBG未接続という旧前提を承認済み限定範囲の厳密検証へ更新。
- docs/reports/kan-23/FOCUS_WYRMSTAKE_EVIDENCE.md、FOCUS_WYRMSTAKE_OBSERVATION.json：24Hit観測と成分別未確定状態。製品計算には読み込まない。
- docs/reports/kan-24/implementation/：報告・差分・ログ・画像・保全結果。

全スイートが既存の自動画像3件を再生成：docs/reports/kan-17-p0/evidence/ui/damage-375.png、damage-390.png、docs/reports/r250-stage6/evidence/ui/after-1440-workspace.png。製品・テストソース以外の既存差分はこの再生成画像のみ。既存ファイル削除なし。
