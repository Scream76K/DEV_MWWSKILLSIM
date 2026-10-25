# 通常スキル接続：ファーストショット

基点154ad99a13adecb688c18d53c05847b604936c7f。新数値・新しい暫定採用なし。

## 優先順位と判断

1. 確定・修正済み：MHDB skill140正式名ファーストショットがAdapterで初弾装填と誤記され、calcBuildの実スキル集計から公開Pipelineへ渡すとSKILL_EFFECT_NOT_PROVENで両channel停止。hope-hammer-browser-adapter.js:41の名称1箇所のみ修正。
2. 継続調査候補：同分類には刃鱗磨きという別名が刃鱗増装へ割り当てられている。取得済みMHDBでは刃鱗増装160/刃鱗研装163。実在入力から誤効果になる反例は今回未確認。新たな係数採用/対象技追加をせず、未確認扱い。
3. 継続調査候補：chargeMaster等のresolveSkillApplicabilityはranged Formulaへの供給を根拠にresolvedを返す。近接charged技全体への接続・適用対象の完全性は今回未確認。名称一致だけで全通常スキル完了とはしない。

## 期待出力と最小入力

原典MHDB467ホープキャノンⅣ raw160 aff0、見切り1/弾導強化2。通常Lv2のcapacity4。初弾珠358はweapon/slot1、武器slot2へ適合、skill140 Lv1。防具・護石なし。原典をfixtureに無加工保存、取得キャッシュ日2026-10-25、HTTP取得時刻不明。

HBG_NORMAL_AMMO_2/適正距離/通常モード0/満装填開始、射撃位置1と2のみを比較。既存Technique DB TECHNIQUE_DB_R120_HBG_NORMAL shotSkills.firstAttack[1]=5を使用。期待は初弾のみ物理攻撃+5、2発目なし、両側の倍率は165/160、通常と最大は同値。武器の見切り4%は通常集計から渡す。stats/skills/plan/realOneHitを上書きしない。

before.jsonでは正式名が未対応でexecution incomplete、合計unavailable。result.jsonは両channel complete/available/有限値、初弾95.19048000000001、2発目92.30591999999999。実summaryにも丸め値が含まれる。装填数は原典4と一致し、3Hitと混同しない。初回ハーネスでfullMagazineをcheckbox扱いしたため、実selectのYESへ訂正してから修正前後のログを取得。

## 静的確認と未確認

- calcBuild → compareStep5Snapshot → evaluateCurrent → referenceSkills.firstShot → BowgunNormalReference.shotを確認。
- bowgun-normal-reference.js:23-26はfullMagazineかつshotOrdinal1だけattack加算。属性成分なし、channelによる最大強制発動なし。
- bow-reference.js:16-18はBOWGUN_ONLY/NOT_APPLICABLE_TO_BOW。弓への火力加算なし。今回は弓再実行なし。
- LBGはbowgun-normal-reference.js:11でこのスキルをUNREVIEWED_SKILLとして拒否。未対応gate解除なし。
- calcAttackSkill/calcElementSkill、standardPowerConditionPlan、min8 applyEffectsの攻撃/属性内訳と既存条件経路も読んだが、全効果・全武器の二重適用がないことを今回保証しない。
- 保存比較は今回未実行。通常/最大の公開calcBuild実入口と表示だけを検証。

朝の追加承認事項なし。アーティアの保留は変更せず、r253-base-artia-source/MORNING_DECISIONS.mdを維持。
