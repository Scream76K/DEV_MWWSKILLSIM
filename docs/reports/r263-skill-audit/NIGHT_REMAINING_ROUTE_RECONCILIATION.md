# 夜間残経路の限定照合

基点 9a0b99b43033b08146ce27ea366ecfa664590ce7。製品変更・追加実行なし。主分類は変更しない。

|ID|静的追跡経路|採用範囲と残件|
|---|---|---|
|87|standardPowerConditionPlan → evaluateCurrent/standardPowerForStats|満タン/低体力の完成枝比較と両立禁止は既存接続。枝未算出を完成最大にしない。特殊経路全体完了とはしない。|
|118|equipmentThunderResistanceInput → ID165 → common cap|MHDB各Lvの全属性耐性を取得。防御Lv1〜3は耐性加算なし。属性吸収併用は別の未対応条件。|
|156|equipmentThunderResistanceInput → ID165 → common cap|MHDB各Lvの雷耐性を取得し防具・承認済み状態加算と合流。特殊成分適用はID165の別残件。|
|160|TECHNIQUE_DB_R115_BOW_STATE → adapter referenceFormula → BowReference.standard|採用済み固定3射・接撃ビンの最大物理のみ1.25、属性不変、射数消費とフォース排他は接続。睡眠等の未採用経路は拡張。|
|162|standardGroupPowerPlan → calcMaxAffinity → L3 conditional affinity → critical-capable Formula|rank/部位条件を検査し最大自己会心+15を接続。固定/雷追加ダメージは注釈専用。注釈式未採用は本体阻害理由にしない。|
|41|MHWElementSkillResolver → equipment.elementComponents / BowgunElementReference → common/component cap|対応属性の倍率/flatと上限経路を静的確認。SA cap基礎は成分別、属性弾は専用基礎。非火強化を竜撃弾の火へ転用しない。CM/変換/条件属性等の特殊併用guardを一律解除せず、個別の採用範囲判断を残す。|
|91|MHWElementSkillResolver → equipment.elementComponents / BowgunElementReference → common/component cap|対応属性の倍率/flatと上限経路を静的確認。SA cap基礎は成分別、属性弾は専用基礎。非火強化を竜撃弾の火へ転用しない。CM/変換/条件属性等の特殊併用guardを一律解除せず、個別の採用範囲判断を残す。|
|121|MHWElementSkillResolver → equipment.elementComponents / BowgunElementReference → common/component cap|対応属性の倍率/flatと上限経路を静的確認。SA cap基礎は成分別、属性弾は専用基礎。非火強化を竜撃弾の火へ転用しない。CM/変換/条件属性等の特殊併用guardを一律解除せず、個別の採用範囲判断を残す。|
|127|MHWElementSkillResolver → equipment.elementComponents / BowgunElementReference → common/component cap|対応属性の倍率/flatと上限経路を静的確認。SA cap基礎は成分別、属性弾は専用基礎。非火強化を竜撃弾の火へ転用しない。CM/変換/条件属性等の特殊併用guardを一律解除せず、個別の採用範囲判断を残す。|

当初B18件の未調査は今回の41/91/121/127で一巡済み。調査済みは全条件接続完了を意味しない。136はsource-marked追撃/集約reference本体への対象可否が未確定。87の診断ラベルは低体力枝を常に赤ゲージありと呼ぶが、今回計算欠陥とは断定しない。

根拠：PASS13_ELEMENT_CAP.md、WYVERN_ORDER_AND_REMAINING_DECISIONS.md、PASS9_CONTEXT_AND_GL.md、現行index.html/adapter。原典再探索なし。

分類：{'火力非対象': 88, '完全接続': 40, '部分接続': 37, '固定ダメージ系・注釈のみ': 6, '欠落': 8}。40/85は火力関係85行中の採用範囲静的完全接続40行。実機40件・全条件完了・③Doneを意味しない。
