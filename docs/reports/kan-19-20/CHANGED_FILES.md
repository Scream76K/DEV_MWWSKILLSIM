# 変更ファイルと根拠

変更前999ファイル中、欠落0、既存変更62。Stage4〜6既存報告は全ハッシュ一致。refs不変。最終テスト一時コピー実行中は元1089ファイル変更0。

## 製品

- index.html: 欠損状態伝播、計算保留、状態異常HP寄与分離、共通表示、提案の基準状態保持、手入力互換。
- build-relative-comparison.js: 未確定・異種属性の比率計算拒否。
- element-state.js（新規）: 属性の値・型・確定状態・理由。
- element-display.js（新規）とassets/element-icons/9 SVG: 日本語名・独自アイコンの共通表示。

## 既存テスト初期化

外部JS/VM依存登録、非属性合成fixtureの明示、属性状態伝播の初期化。test名/skip不変、assert文59/60不変、唯一r139は新guardと従来raw参照の構造検査。数値期待値変更なし。詳細evidence/qa/assert-fixture-audit.json。

- tests/r139-raw-metrics-spec.test.cjs
- tests/r192-dps-build-parity.test.cjs
- tests/r193-power-parity.test.cjs
- tests/r194-skill-build-impact.test.cjs
- tests/r211-build-decoration-impact.test.cjs
- tests/r212-decoration-comparison-integration.test.cjs
- tests/r214-standard-power-comparison-scope.test.cjs
- tests/r215-real-generic-damage-index.test.cjs
- tests/r216-saved-build-comparison-flow.test.cjs
- tests/r217-armor-charm-comparison.test.cjs
- tests/r218-combined-build-comparison.test.cjs
- tests/r219-elemental-build-comparison.test.cjs
- tests/r248-independent-dps-diagnostics.test.cjs
- tests/r249-saved-build-weapon-matrix.test.cjs
- tests/r250-dps-verification-gate.test.cjs
- tests/r46-regression.test.cjs
- tests/r53-hp-part.test.cjs
- tests/r55-damage-states.test.cjs
- tests/r56-horn-components.test.cjs
- tests/r59-hit-attack-modifier.test.cjs
- tools/ai-combo-evaluation-browser.test.cjs
- tools/ai-combo-evaluation-dom.test.cjs
- tools/attack-components-dom.test.cjs
- tools/backup-report-browser.test.cjs
- tools/bonus-damage-dom.test.cjs
- tools/bow-state-browser.test.cjs
- tools/canonical-presets-browser.test.cjs
- tools/canonical-presets-dom.test.cjs
- tools/canonical-route-browser.test.cjs
- tools/canonical-timing-browser.test.cjs
- tools/charge-blade-combo-browser.test.cjs
- tools/charge-blade-combo-dom.test.cjs
- tools/combo-blockers-browser.test.cjs
- tools/combo-blockers-dom.test.cjs
- tools/combo-editing-browser.test.cjs
- tools/combo-editing-dom.test.cjs
- tools/combo-evaluation-dom.test.cjs
- tools/combo-persistence-dom.test.cjs
- tools/combo-verification-dom.test.cjs
- tools/comparison-readiness-browser.test.cjs
- tools/comparison-readiness-dom.test.cjs
- tools/damage-context-browser.test.cjs
- tools/damage-context-dom.test.cjs
- tools/expanded-combo-dom.test.cjs
- tools/fortify-condition-browser.test.cjs
- tools/fortify-power-browser.test.cjs
- tools/frame-timing-browser.test.cjs
- tools/frame-timing-dom.test.cjs
- tools/group-power-browser.test.cjs
- tools/group-power-dom.test.cjs
- tools/hbg-normal-dom.test.cjs
- tools/hbg-shot-skills-dom.test.cjs
- tools/hit-details-browser.test.cjs
- tools/hit-details-dom.test.cjs
- tools/power-conditions-dom.test.cjs
- tools/power-index-dom.test.cjs
- tools/r250-dps-verification-browser.test.cjs
- tools/r250-dps-verification-dom.test.cjs
- tools/scorch-route-dom.test.cjs
- tools/simulator-backup-dom.test.cjs

## 新規テスト・記録

契約46件、DOM4件、Browser1件、共通fixture、隔離runner、5幅UI監査と証跡。CALC/DATA/UI/QA/REVIEW/REPORT、変更前アーカイブ、安全確認JSON。

既存143集合の全一覧はr250内で未特定なのでtracked327と同一視せず、132内容一致を断言しない。全既存内容は変更前アーカイブで保全、削除0。
