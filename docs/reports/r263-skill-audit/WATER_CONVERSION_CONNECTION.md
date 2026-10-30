# 水変換181の限定接続

太刀/弓の水属性本体、非負整数の装備由来耐性R×4を表示属性flatとしてcap前へ一度。承認外の他武器/非水/負耐性/属性弾/食事/未定義状態は拡張しない。OWNER_APPROVED_PROVISIONAL・実機未検証。

MHWaterConversionRuleが唯一の係数源。既存耐性producerにelement引数を追加（既定thunderを維持）、water84/防御/既採用全耐性状態を取得。未入力は未解決、負値は拒否。水/雷のpending名を分離し、検証済み水だけ解決。L3 element add→元属性cap→LS本体/Bow elementBasis。弓診断はFormulaのeffectiveDisplayedElementを保持。

契約入力: 表示水500、防具水10/200＋水耐性Lv1の6。R16/206→flat64/824、属性564/1150（未cap1324、cap1150）。物理不変、flat一度、通常/最大とも成立。
long-sword: 83.23, 85.15, 102.73
bow: 73.512, 79.272, 132.012

保存読込とA/B復元一致。誤Lv2/負耐性/対象外は拒否。initial失敗と修正はexecutionに保持。最終exit0、source hash一致。雷producerは既定引数/元係数不変を静的確認、当初は雷テスト再実行なし（下記独立レビュー是正で代表1件を追加確認）。食事/一時耐性の自動算入なし。ゲーム/実装備成立は未検証。原典https://kuroyonhon.com/mhwilds/program/skill.php、承認Sentinel_a09cfc211a288191aac6ddbf7ee73dd7。

分類40完全/39部分/6欠落/6注釈/88非火力。40/85不変。新しい全体PASSではない。commit/pushなし。

## 独立レビュー後の証拠是正
初回outsideはTECHNIQUE_NOT_FOUNDで止まっており、水変換ルール拒否の証拠ではなかった。元出力は保持。今回は公開calcBuildで有効なハンマー採用技列＋水500＋水変換1を使用し、WATER_CONVERSION_SCOPE_UNSUPPORTEDを確認。共通producer回帰はGS1081雷500＋契約耐性70の1件のみ：加算350、cap後850、通常/最大総計1210.96。最終製品hash不変、exit0。非水属性・耐性欠損の拒否は静的確認のみで未実行。他の成功ケースは再実行なし。

## Bow CM combination follow-up
Public calcBuild exposed a real maximum-channel disconnect: the dedicated Bow Formula consumed CM, but the upstream CM pending marker remained. The adapter now resolves only that marker after validating skill ID24/Lv1–3 against the existing Bow DB multiplier map and adopted technique set. No coefficient/Formula/bundle change. Invalid/unadopted paths retain existing guards.

Water500 Bow: conversion R10 gives 540; Water Attack3 gives 700; adding CM3 gives 790 = 500×1.2×1.15+60+40. R200 caps at 1150. Normal/maximum totals: 77.112 / 91.512 / 99.612 / 132.012 respectively; physical stays 28.512. Combined snapshot restores identical channels. Synthetic contract input only. Before exit1 and after exit0 are recorded in water-combination-execution.json, with raw output and exact local product delta. Existing saved A/B evidence is reused, not rerun.

Draw8/103 read-only follow-up: referenceDrawCount/referenceDrawAdds/referencePunishingAdds already retain Bow DB hit count/order, normal-ammo DB hitCount, explicit elemental-ammo contact count, and SAED body array length. BowReference validates exact arrays and consumes additions per arrow; SAED forwards only body arrays. Generated special follow-ups are not implicitly included. No additional confirmed adopted-body disconnect found in this bounded review; no draw code change or repeat test. Matrix remains 40 complete /39 partial /6 missing; this is a scoped product fix, not whole-skill completion.

## Conditional water follow-up (no product delta)
Public calcBuild synthetic LS_RED_BLADE_I and BOW_SHOT_3, water500 + Water Attack3 + Coalescence3/Burst1 (Bow additionally CM3). Normal/maximum element without→with water conversion: LS 660/810→700/850; Bow 750/893.5→790/933.5. Conditional effects change maximum physical through Burst; water conversion itself leaves both channels' physical identical. Existing multiplier→flat→base cap route accepts the combination; no new disconnect found.
Bow saved conversion OFF/ON outputs equal original channels, active conditions/result/snapshot unchanged. Captured valid technique with unresolved water-resistance input reaches WATER_RESISTANCE_UNRESOLVED:CONTRACT_MISSING_RESISTANCE; this negative is adapter-boundary validation, not invalid UI input. One execution exit0, hashes/raw in water-conditional-execution.json. Product untouched, matrix 40/39/6 unchanged. Contract inputs only, no real equipment or game claim.
