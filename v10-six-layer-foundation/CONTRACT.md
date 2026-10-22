# V10 最小6層契約 v10-min1

**位置づけ:** 独立実装。GitHub/製品の既存計算経路へは未接続。ゲーム内数値や暫定式を含まない。

| 層 | 責務 | 入力 | 出力 | 禁止 |
|---|---|---|---|---|
| L1 Input Adapter | 捕捉済み入力の標準化 | source | EvaluationRequest | DOM参照・暗黙数値変換 |
| L2 Build Resolver | MHDBに基づく装備・スキル解決 | request, resolver | ResolvedBuild | 効果計算・推測補完 |
| L3 Effect Resolver | 通常・最大それぞれの効果解決 | build,conditions,resolver | EffectContext[2] | 会心だけの最大条件代用 |
| L4 Weapon Engine | 14武器共通Routerと各Handler実行 | build,effects,target,evaluation | WeaponResult[2] | DOM参照・共通効果の二重計算 |
| L5 Result Aggregator | 非正規化数値・未実装・問題の集約 | build,effects,weaponResult | EvaluationResult | 別途ダメージ再計算 |
| L6 Presentation Adapter | 単独/比較表示用データ作成 | EvaluationResult A/B | ViewModel | スナップショット適用・共有状態変更 |

- L1要求: `schemaVersion='v10-min1'`, `build`, `target`, `conditions`, `evaluation.mode`。後続層の詳細フィールドはアダプター注入によって拡張する。
- L2要求: `weaponType`, `equipment`, `skills`, optional `issues`,`extensions`。未登録種は拒否。
- L3要求: `effects: Record<string, Datum>`。Datumは `{status:'known',value:<non-null>}` または `{status:'inactive'|'unknown'|'not_applicable'}`。ゼロはknown(0)。暗黙の `Number(null)` 禁止。
- L4要求: `{status:'OK'|'PARTIAL'|'BLOCKED'|'NOT_IMPLEMENTED', components:[], metrics?:{},issues?:[]}`。未実装はゼロ扱いしない。
- L5要求: metricsの値は確定数値またはnull。未確定の理由はissuesに保持。DPSが未確定でもダメージは保持。
- L6要求: A/Bの非正規化値を維持。相対値は別枝。武器種が不一致なら比較状態`WEAPON_MISMATCH`。

**追加契約ルール:** フィールドの新設は可能。既存フィールドの意味変更・デフォルト捏造は禁止。武器固有拡張はextensionsまたはHandler固有引数へ。実装・統合前に既存MHDB、Technique DB、スキル条件、丸め方式との整合性を確認。

**本段階の限界:** 既存の14武器Handler・保存比較UI・実ブラウザは未接続。テスト用Handlerにだけ小さな算術スタブあり（ゲーム計算として扱わない）。
