# 14武器 火力計算接続状況

基準 checkout: `himmel/real-db-one-hit-physical-slice`

この資料は、`index.html` の既存 `GENERIC_STANDARD_PROFILES`、`BUILD_COMPARISON_HANDLER_REGISTRY`、`TechniqueDBEngine` の定義を読み取って整理したものです。登録済みの固定ルートと、装備ビルドから共通Pipelineへ接続済みであることは別に扱います。

| 武器 | 既存基盤 | 現在の状態 | 具体的な不足 |
|---|---|---|---|
| 大剣 | Generic STANDARD | 固定ルートの参考計算に接続 | 状態依存技・衝撃波・実UIの新Pipeline接続 |
| 太刀 | Generic STANDARD | 固定ルートの参考計算に接続 | 練気状態遷移と実UIの新Pipeline接続 |
| 双剣 | Generic STANDARD | 固定ルートの参考計算に接続 | 鬼人状態・連続Hitの実UI接続 |
| 片手剣 | Generic STANDARD | 固定ルートの参考計算に接続 | 盾・特殊成分と実UIの新Pipeline接続 |
| ハンマー | Generic STANDARD / real DB slice | 物理・属性・保存A/B・複数Hitの共通Pipeline接続 | 実ブラウザ確認、他技・特殊状態 |
| ランス | Generic STANDARD | 固定ルートの参考計算に接続 | ガード・反撃状態と実UIの新Pipeline接続 |
| スラッシュアックス | Generic STANDARD | 固定ルートの参考計算に接続 | 剣／斧状態遷移と実UIの新Pipeline接続 |
| 操虫棍 | Generic STANDARD | 固定ルートの参考計算に接続 | エキス状態別statsと猟虫成分 |
| チャージアックス | 専用 Handler | 専用比較経路あり | ビン・属性解放の実Pipeline統合 |
| 狩猟笛 | 専用Handler候補 | Evidence gated | 演奏音波・響玉・本体成分の根拠とHandler |
| ガンランス | 専用Handler候補 | Evidence gated | 砲撃・竜杭の発生回数とFormula |
| ライトボウガン | 専用Handler候補 | Evidence gated | 弾・速射の計算単位と現行版係数 |
| ヘビィボウガン | 専用Handler候補 | Evidence gated | 属性弾・多段HitのFormula。通常弾は別の参考比較のみ |
| 弓 | 専用Handler候補 | Evidence gated | 溜め・矢Hit・距離・ビンの現行版接続 |

## 共通スキル

- `攻撃` は既存 `calcAttackSkill` をL3効果へ渡す接続がある。Lv範囲は現在Lv1〜5で、他の条件付き効果を推測していない。
- `見切り` は既存 `calcAffinityBonus` をL3会心効果へ渡す接続がある。Lv範囲は現在Lv1〜5。
- `KO術` は既知ID36/Lv1を認識するが、HPダメージ補正には非適用として根拠付きで扱う。
- その他の火力関連スキルは、既存の比較計算Coreに定義があるものと、6層Pipelineへ接続済みであることを分けて監査する必要がある。未知・条件不明の効果は未算出とする。

## 現在の完了判定

「固定STANDARDの参考計算に対応」は、実装備・発動スキル・保存A/Bが同じ6層Pipelineを通ったことを意味しない。現時点でその接続を確認済みなのは、ハンマーの限定実DBスライスです。DPSはβペンディングであり、武器対応の完了条件に含めません。

次の優先対象は、既存Technique DBで通常物理・属性の根拠が揃うGeneric STANDARD武器を、ハンマーと同じ装備snapshot→L2/L3→L4→L5入口へ接続することです。固有成分の根拠が不足する武器は、登録済みの数値を流用せずEvidence gatedのまま保持します。
