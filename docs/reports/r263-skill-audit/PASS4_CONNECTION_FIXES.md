# Stage3 実接続 第4差分（未commit）

基点6c71e818919379b0b0649d2389237470cbe3802f。黒蝕/灼熱化/会心撃武器別係数/弾導強化新係数は未採用のまま。

## ①採用済み効果の断絶：5属性強化

ID50火・91水・127雷・121氷・41龍はcalcElementSkillの既存Lv表を共用。AdapterのelementValue=weaponBase*mult+flatから一般build.element/elementComponentsへ供給されるが、IG stateStatsByStateだけelementをweaponBaseへ戻していた。通常側には再加算イベントがないので強化が消失。NO_EXTRACT/TRIPLE_EXTRACTのelementを検証済みelementValueへ変更した。三色による攻撃倍率や属性スキル係数は変更なし、L3で同じ強化を再適用しない。

最小契約入力：既存IG2Hit技DB、仮の火属性100、火強化Lv0/2、火肉質.2。合法実ビルド/④検証ではない。修正前Lv0/Lv2とも物理7.82+12.17、属性2.40+2.40。修正後Lv0不変、Lv2は属性3.84+3.84、通常/最大とも合計24.79→27.67。100*1.1+50=160の一度反映をassert。element-state-before/after.json、tools/skill-element-state-proof.cjs。

## ②非火力入口許可不足

36 KO術Lv2/3（旧分岐はLv1のみ）、169シールドオプションLv1、179にゃんにゃんぼうLv1。MHDB原文の気絶/防御/アイテム入手は、固定状態の採用武器HP式に数値を加えない。既存INTERNAL_SKILL_ADOPTIONにexact ID/maxLvで登録。GL/HBG専用入口もconfirmedNonDamageを共用。新HP式や防御効果のゲーム内挙動を実装した意味ではない。

同じGS契約入力で3スキルが修正前未算出→修正後通常/最大375.73（スキルなしと一致）。KO4/にゃん2は拒否を維持。utility-pass4-before/after.json。ID偽装許可や任意未知スキル一括許可はしていない。

## 共通式の到達監査

- 攻撃72：calcAttackSkill→attack-boost-multiply/flat→engine.applyEffectsのweaponBase*mult+flat。共通本体はGS/LS/SNS/DB/HAM/HH/LAN/GL/SA/CB/IGへ到達。BowReference、通常弾、属性弾の攻撃依存部、HH音波、HBG竜撃、CB榴弾へ既存attack/attackComponentsが渡る。強属性ビン/本体属性/固定10は攻撃対象外。通常最大同じ式、条件増分は別effect。matrixの武器列に経路根拠を反映。
- ただしGL砲術併用はgunlance-shell-reference.calculateが非identity攻撃内訳をARTILLERY_ATTACK_ORDER_PENDINGで拒否する。ここを無断解除せず、攻撃行全体は部分を維持。順序の採用記録照合が必要。
- 見切り3：calcAffinityBonus→critical-eye-affinity/element→engineでlogicalId重複排除→会心対象Formula。非会心特殊ではaffinity stageを除外。ただし通常側会心上限を共通本体はclamp、弾Referenceは入力範囲検査にする差があり、全経路完了へは上げない。
- 5属性強化：上記状態別消失を修正。上限と条件属性乗算/会心撃相互作用の監査は残る。
- 条件攻撃群：既存standardPowerConditionPlanのnormal/max内訳はL3へ到達するが、条件ごとの合法同時成立/特殊式の適用対象が残る。既知条件が通るだけで群全体を完全としない。

## ③新しい採用・範囲判断

82会心撃の非弓Lv表、53弾導強化Lv3の物理attack flat+5、106黒蝕、71灼熱化は親確認待ち。83溜打強化の版差、159焼き砲モロコシ、163刃鱗研装、171炎の料理人、174連携プログラム、182鏡刃追撃は数値/条件/成分契約の採用照合が必要。状態異常/付与11件も発生条件や対象技の範囲を勝手補完しない。元の欠落40すべてを解消したとはしない。

分類全体は完全1/部分56/非対象82/欠落40。今回は部分群内部の具体的消失と非火力入口3件を修正した成果であり、ラベル数減少を目的に完全へ移していない。追加実機/保存AB/CI/全体回帰なし、Safariと元Stage3差分保護、commit/push前報告。
