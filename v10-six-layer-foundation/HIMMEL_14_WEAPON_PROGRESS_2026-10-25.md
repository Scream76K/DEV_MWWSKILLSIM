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
- `超会心` は既存 `criticalMultiplierForState` を使うCanonical Formula入力へ接続済み。Lv1〜5以外は未算出。
- `抜刀術【技】` は既存 `calcMaxAffinity` の最大側会心加算へ正規化して渡す接続を追加した。抜刀術【力】は気絶蓄積・モーション条件の共通Formulaが未接続。
- `通常弾・通常矢強化`、`散弾・剛射強化`、`チャージマスター`、`会心撃【属性】`、`刃鱗増装`、`ファーストショット`、`フォースショット` は、既存の弓／ボウガンReference FormulaとTechnique DBのskillRulesへ渡るL3適用可否を接続した。弓のチャージマスター・会心撃【属性】・刃鱗増装は `bow-reference.js`、通常弾系は `BowgunNormalReference` が実値を消費する。通常弾強化の対応範囲、弓の溜め・ビン、速射・追加弾の現行版適合は未検証のためEvidence gatedのまま。
- `会心撃【属性】` の共通Element Formulaは、装備snapshotの `criticalElementLevel` をCanonical Formulaへ渡し、正の会心率時だけ属性会心を適用する。近接武器でのゲーム版適合と発動条件は未検証で、所持していない場合は従来どおり非適用。
- 条件付き火力スキル（挑戦者、フルチャージ、逆恨み、巧撃、逆襲、攻勢、火事場力、暗黒、攻めの守勢、急襲、連撃、属性吸収、災禍転福、不屈）は、既存 `standardPowerConditionPlan` の条件・Lv・適用順をL3の最大側効果列へ渡す接続を追加した。条件計画が `PARTIAL` の場合は最大側を未算出理由付きで保持し、通常側へ最大条件を混入させない。今回の条件切替の実UI確認は未実施。
- その他の火力関連スキルは、既存の比較計算Coreに定義があるものと、6層Pipelineへ接続済みであることを分けて監査する必要がある。未知・条件不明の効果は未算出とする。

### 採用DBスキルの未接続・保留

- `抜刀術【力】`、`研鑽`、`属性変換`、`耐性変換`、各種シリーズ固有効果の一部は、既存DBに名称・条件はあるが、共通L3の成分対象と適用順が未接続。抜刀術【技】は上記のとおり接続済み。
- `連撃`、`災禍転福`、`属性吸収`、`火事場力`、`不屈`、`攻めの守勢`、`急襲`などは既存 `standardPowerConditionPlan` に数値定義がある。ただし条件入力が不足する場合は最大側を保留し、未発動条件を最大値へ流用しない。
- `砲術`、`砲弾装填` は砲撃Formulaの明示状態へ接続済みだが、砲撃種別・装填数・現行版適合が限定範囲。`CB`のビン数・`HH`音波回数・弓の状態入力は専用残件。
- シリーズ／グループ効果は、`calcBuild`が生成した`activeBonusEffects`（部位数、必要部位数、rank、source、bonusSkillId）を装備snapshotへ保持し、`standardGroupPowerPlan`の`groupMultiplier`をL3へ明示的に渡す経路を接続した。適用順は原始値→攻撃スキル倍率→シリーズ／グループ倍率→最大条件倍率→通常flat→条件flat。既存の2/3/4部位判定・排他・最大側条件は変更していない。未テストの効果は、既存ルールがない場合は未算出のまま。

## 現在の完了判定

「固定STANDARDの参考計算に対応」は、実装備・発動スキル・保存A/Bが同じ6層Pipelineを通ったことを意味しない。現時点でその接続を確認済みなのは、ハンマーの限定実DBスライスです。DPSはβペンディングであり、武器対応の完了条件に含めません。

次の優先対象は、既存Technique DBで通常物理・属性の根拠が揃うGeneric STANDARD武器を、ハンマーと同じ装備snapshot→L2/L3→L4→L5入口へ接続することです。固有成分の根拠が不足する武器は、登録済みの数値を流用せずEvidence gatedのまま保持します。
