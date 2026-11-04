# CB属性変換152 — 榴弾専用no-flat候補の強属性ビン境界（2026-11-04）

## 基準と結論
分岐元 `flamme/cb-152-negative-state-guards-20261104`、固定 SHA `4866f61e052deed08bca5f0b4f8afb293e901b7b`。専用分岐 `flamme/cb-152-phial-kind-boundary-20261104`。**CANDIDATE_NOT_ADOPTED / OWNER_REVIEW_PENDING**。

公開 `calcBuild()` を実MHDB・実装備テンプレ `KOTATU_CB_01` で使用し、属性変換152の非龍属性no-flat候補が榴弾ビン以外へ広がらないことを検証。今回の変更は **テストとCIのみ**。製品計算アダプター、Technique DB、ビン係数、Hit、UIへの変更はない。

## 実在武器・条件
- MHDB103 `ウズ・ヴァレロヤⅡ`（強属性ビン / 水）。
- Hを含む正規R/H独立固定コンボ。AXE開始、盾強化ON、斧強化ON、剣強化OFF、R/H各通常ビン2本、強化ビン0。訓練場正面。
- 属性変換152は通常OFF固定、最大だけON/OFF切替。既存の攻撃・装備・ターゲットは同じ。

|条件|通常R/H丸め前|最大R/H丸め前|理由|
|---|---:|---:|---|
|152最大ON|2096.251999999999|保留|`R/H:REAL_SLICE:ATTRIBUTE_CONVERSION_BODY_SCOPE_UNSUPPORTED`|
|152最大OFF|2096.251999999999|2631.2839999999997|両方complete|

ON時にH/榴弾向けno-flat候補が強属性ルートへ入り込むことはない。通常側は最大条件ON/OFFで完全一致。OFFの両チャネルは既存R/Hで完走する。

## 既存の否定条件・回帰
`tools/cb-152-negative-state-guards.cjs` に実MHDB103のケースを追加。旧MHDB79榴弾の以下の証拠を維持：
- 既定AXE/盾ON/斧強化ON、非龍属性・152最大ON → no-flat候補が計算完遂。
- 斧強化OFF（資源は十分） → `ATTRIBUTE_CONVERSION_BODY_SCOPE_UNSUPPORTED`。
- 盾強化OFF → 既存H状態契約で停止。
- 最大発動状態UNKNOWN → `ATTRIBUTE_CONVERSION_STATE_REQUIRED`、通常は独立完遂。

[GitHub Actions run 41777008854](https://github.com/Scream76K/DEV_MWWSKILLSIM/actions/runs/41777008854) completed/success。独立R/H、実装備A/B、強属性H、全20強属性武器、榴弾61武器、飛燕非適用、雷変換165、刃鱗163、アーティア合法復元等の回帰も成功。

## 未採用・残件
本テストは**候補の範囲外で拒否することを確認した**もので、適用範囲拡張の製品変更ではない。強属性H盾突きビン爆発1Hit・消費0の実ゲーム根拠、152の発動条件/追加追撃、全装備・全状態・Safari・ゲーム内計測、正式統合・β公開、全スキルの未算出ゼロは未完了。比較対象の数値はJSDOM実装結果である。
