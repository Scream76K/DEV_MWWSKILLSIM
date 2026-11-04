# CB 属性変換152 — 非龍属性no-flat候補の否定状態境界と診断範囲（2026-11-04）

## 基点と採用状態
- 分岐元：`flamme/cb-152-effective-element-boundary-20261104` `e62466246fc441e71596a01b381ab3c8c91e9e20`。
- 作業ブランチ：`flamme/cb-152-negative-state-guards-20261104`。**CANDIDATE_NOT_ADOPTED / OWNER_REVIEW_PENDING**。main、ユーザーUI、βに未統合。
- 前候補の榴弾61/61・強属性20/20の限定計算、実効龍13/非龍48の分類を維持。通常/最大別計算・R/H独立開始・丸め前合算は継続。

## 今回の計算コード変更
`hope-hammer-browser-adapter.js` の属性変換152診断 `referenceScope` と `comboTotalDamage.scope` を、**非龍属性の正規CB R/H・榴弾ビンかつ既定状態**に限り、
`CB_RH_NON_DRAGON_FLAT_NOT_APPLICABLE_FOLLOWUP_EXCLUDED`
と明示。これは武器の龍属性値flat非適用と、固定コンボ外の追加追撃除外を示す。

ダメージ・ビン係数・Hit数・対象イベントは変更なし。152最大側が明示OFFなら従来の `CONVERSION_INACTIVE_REFERENCE` を維持。龍属性武器の既存加算+cap/診断は変更しない。非認定の技・状態や発動未指定では保留理由を維持する。

## 新たな公開計算の否定条件テスト
`tools/cb-152-negative-state-guards.cjs` は実MHDB79（ホープアームズⅠ）と実テンプレKOTATU_CB_01、訓練場正面、通常152OFF・最大152ONを基準に公開 `calcBuild()` を実行。装備を変えず、斧/盾強化と発動状態だけを変更。

| ケース | 通常 | 最大 | 条件と判定 |
|---|---:|---:|---|
| R/H既定状態 | 949.5240000000002 | 1329.9899999999998 | 双方complete、指定のscope表示 |
| 斧強化OFF、通常ビン5本 | 666.164 | 保留 | R/H最大側 `ATTRIBUTE_CONVERSION_BODY_SCOPE_UNSUPPORTED` |
| 盾強化OFF | 保留 | 保留 | H `CB_H_EXPLICIT_MODE_SHIELD_SWORD_REQUIRED` 等 |
| 最大152発動状態UNKNOWN | 949.5240000000002 | 保留 | 両ルート `ATTRIBUTE_CONVERSION_STATE_REQUIRED` |

斧強化OFFを初期ビン2本で試した最初のCI（run41770236786）では、単にRで `CB_ED1_PHIAL_STOCK_INSUFFICIENT` が先に発生した。そこで合法な5本に変更し、**ビン不足と152適用範囲を独立して検証**した。未知状態を勝手にOFF/ON補完せず、盾強化なしの既存状態契約も解除しない。

## CI
- [run41770385932](https://github.com/Scream76K/DEV_MWWSKILLSIM/actions/runs/41770385932) — 否定条件テスト・既存回帰success。
- [run41770632405](https://github.com/Scream76K/DEV_MWWSKILLSIM/actions/runs/41770632405) — **製品診断scopeを追加した候補コードと全回帰テストがcompleted/success**。実MHDB強属性20、榴弾61、保存比較、雷耐性165、刃鱗163、アーティアなど既存候補の検証を維持。

## 正式受入に残る条件
- 非龍属性に龍武器flatを加算しない処理の限定採用と、「追加龍追撃は固定コンボ総計に算入しない」というユーザー仕様の整合確認。
- 強属性H盾突きの実機ビン爆発Hit数・消費0、飛燕86のH限定非適用、榴弾163/165候補の承認。
- すべての武器/状態/装備/スキル、Safari、実機精度、main/UI/β統合は別途。
