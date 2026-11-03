# CB H強化ビン — 限定計算候補（未統合）

日付: 2026-11-03
分岐元: `55e597ecbb8f02423817b0a3007b9774aa56cfcc` (`flamme/cb-rh-distinct-ab-regression-20261103`)
候補: `flamme/cb-h-enhanced-provisional-20261103`
技術状態: **候補・CIで限定成立。正式採用・β公開は未承認。**

## 既存正本・根拠

- 技・Hit/MV・ビン係数: 既存Technique DBと既存H採用レコードを正本とし、今回数値や成分を再定義しない。
- 操作と強化ビン消費の出典: https://kuroyonhon.com/mhwilds/memo/12.php
  - 強化ビン優先消費
  - 榴弾ビンの高出力/追撃: 通常0.16、強化0.20（資料の現行記載）
  - 斧強化時の高出力ビン消費0.5
  - 盾突きの通常ビン爆発係数0.05、H接続の爆発1回/消費0は既存 **OWNER_APPROVED_PROVISIONAL** を引き継ぐ。強化ビンの存在で盾突きの爆発が強化係数に切り替わると推測してはいない。
- 現行限定受入履歴: `docs/reports/stage4-bow-representatives/CB_H_CONNECTION_REPORT.md`。元Hは榴弾・通常ビンに限定。今回の候補は範囲拡張であり当該承認そのものの拡大解釈ではない。

## 変更範囲

- `hope-hammer-browser-adapter.js`: H exact route、AXE_NEUTRAL開始、盾ON、剣OFF、榴弾など既存条件を維持しつつ、強化ビン0固定の入力制限を解除。明示された強化ビン在庫は非負0.5刻みで検査。
- H前段のビン消費0は、分岐元で修正済みのL5を使用。H前段以降の強化優先選択、正の消費量、各爆発係数は既存の共通経路を再利用。
- 数値DB、Hit、MV、固定コンボR、SAED、他武器のHandler、共通係数には変更なし。
- `tools/cb-rh-reason-matrix.cjs` を候補期待値に対応、`tools/cb-h-enhanced-isolated-probe.cjs` を本物の候補HTMLで実行。新規 `tools/cb-h-enhanced-distinct-ab-proof.cjs` は異装備2件の公開calcBuild→保存→比較→復元。

## CI 限定証拠

https://github.com/Scream76K/DEV_MWWSKILLSIM/actions/runs/41604570012

- R/H集計3単体テスト、既存異装備A/B公開経路、CB理由行列、H強化ビン候補公開経路、H強化ビンの異装備A/B公開比較がすべて成功。
- H強化0.5+通常0.5開始: A通常3618.117900000001/最大4391.921900000001。B(頭防具なし)通常3575.0379000000003/最大4123.8459。保存比較の各行が個別計算と一致。H残ビン0/0。
- H強化1+通常1、H強化2のみの候補テストも計算完遂。元H通常ビン経路は不変。
- JSDOM/実MHDB/実テンプレによる限定証拠であり、Mac Safari・実機ゲームの直接確認ではない。

## 非採用・未解決

- 強属性ビン、剣強化ON、盾OFF、任意の技列、斧強化OFFでの混在消費などは本件の解禁対象外。
- H盾突きの強化ビン存在時における詳細効果は、既存暫定盾突き係数を引き継ぐのみで、直接実測したものではない。
- 既存H限定承認を変更する権限者の正式判断、独立レビュー、Safari、実機検証、develop/main統合、公開は未実施。
- 全チャアク未算出ゼロの宣言は行わない。
