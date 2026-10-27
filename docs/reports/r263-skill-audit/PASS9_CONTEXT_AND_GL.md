# Stage3 pass9：心眼/鈍器の本体接続・GL通常砲術

未commit。元Stage3差分を保護。

## 心眼・鈍器

数値正本MHContextAttackSkillRulesからL3のcontextAttackEffectsへ供給。engine.applyEffectsにcomponentIds選択を追加し、対象物理Hitだけ攻撃乗算、攻撃flat前に適用。属性・他Hitへ反復しない。心眼はoriginalPhysicalHitzonesをbuildへ保持し、effectPlanに使用値と種別を保持。傷後値は通常のダメージ肉質に使用し、判定には傷前値を使用。明示傷ありで元肉質欠損なら拒否。現UIの訓練場は傷なし原典肉質を使用。
鈍器は既存武器斬れ味resolverが選ぶ最大斬れ味を使用する。自由な斬れ味切替UIを新設した意味ではない。特殊斬れ味/特殊成分の適用は未接続として保留。

最小入力：GS既存3技・攻撃5（1.04と+9を識別）、緑斬れ味、傷前切断40/ダメージ肉質80。
心眼3はB*1.04*1.3+9で545.56、鈍器3はB*1.04*1.1+9で467.41。通常/最大とも各物理Hitへ一度。正本damageFromParamsとの各Hit値一致まで確認。最初のハーネスのkindフィルタが空集合だったため、coefficientUnitで対象を選び非空assertと値比較を追加した。resolver単体対照に根拠ref不足の環境エラーもあり、fixture根拠を付与して再確認。製品の期待値を書き換えたものではない。
context-attack-before/after.json、tools/skill-context-attack-proof.cjs。

## 飛燕は未完

既存R58 sourceHitRules.jumpSkillにHit別分類があるが、該当IG技は数値/本体技採用の保留を含む。今回それを解禁していない。原典memo27の対象Hitと採用IDの一致を優先する。HH重ねがけ/SA覚醒追撃/CB斧追撃は明示非対象。次候補は既存登録IG飛円斬りの採用可否を確認した上でHit別1.1を同じcomponentIds機構へ供給すること。技名だけでsource-only候補を採用済みにしない。

## GL通常砲術（新owner承認）

Technique DBの砲術契約へattackOrder=BASE_MULTIPLIERS_ARTILLERY_THEN_FLAT、OWNER_APPROVED_PROVISIONALを保持。GunlanceShellReference.calculateは攻撃内訳整合を検査しB*M*artillery+flatを作成してから既存技係数を適用。火属性値/肉質式は不変。既存supportedActions NORMALのみ、溜め等へ拡張しない。
公開黒蝕II通常砲撃：砲術なし9.4/9.8（基準/最大）を維持、砲術1は10.36/10.76。
直接最小対照B100*M1.2・砲術1・flat0/20は物理計算攻撃126/146。砲撃物理10.08/11.68、火2/2。flatに砲術が掛からず火不変。
暗器蛸/闢獣の解決済みrankも専用入口から共通attackComponentsへ通す静的接続。今回の公開実行は黒蝕、他2系列を実行したとはしない。
gl-artillery-flat-before/after.json、tools/skill-gl-artillery-flat-proof.cjs。旧gl-black-afterは当時の砲術保留証拠として保持。

## ③残件の優先順

1. 飛燕86の採用Hit対応、心眼136/鈍器85の特殊成分・ranged適用、元肉質入力範囲。今回の本体接続を全武器完全としない。
2. 共通属性群：火50/水91/雷127/氷121/龍41と連撃95・災禍転福13・属性吸収133の上限/競合/属性弾への条件属性消費。通常属性への既存経路は保持されており、まとめて属性内訳とconsumer単位で照合可能。
3. 条件会心群：弱点特効57・渾身99・力の解放142・濡れ刃紋39の成立条件/排他と14式への共通供給。全武器実行でなく共通L3と非会心除外を追う。
4. 射撃群：速射強化23の対象モード、特殊射撃69/貫通94、ビン追加5/44/65/79/116の能力許可と選択契約。古い非速射gateを最終対象外にしない。
5. 残る系列/イベント/新効果：花舞34・凍峰62・雪獅子107・踊火161・千刃167・夢灯170・巨戟178・祝謡180、焼き砲159/刃鱗研装163/炎の料理人171/連携174/水耐性変換181等の具体的根拠を照合。

③全体未完。大量回帰・CI・Safari・保存ABは追加実行なし。commit/pushなし。
