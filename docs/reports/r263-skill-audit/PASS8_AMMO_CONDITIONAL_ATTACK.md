# Stage3 pass8：属性弾の条件攻撃consumer

基点6c71e818、未commit。HBG/LBG共通のreferenceFormula分岐を修正。

旧activeBonusEffects/conditionalAttack一律拒否を、解決済み計画と攻撃内訳の検査へ置換。engine.applyEffectsが生成したB×M+Fとstats.attackの一致を確認し、その値をBowgunElementReferenceへ一度渡す。Formula側で再度条件倍率を掛けない。弾導+5はphysicalAttackAdd、属性flatはelementFlatを維持。
未知の系列効果、特殊射撃/射撃順、属性変換/耐性変換は解禁しない。最大側条件属性加算・乗算は今回未採用なので最大だけ理由付き未算出とする。通常側までその理由で止めない。

最小公開入力はHBG467雷弾Lv1・雷強化2・弾導3と系列rank。通常attack160、物理10.6656、攻撃依存属性10.56、flat1.5。
- 暗器蛸I最大attack175、物理11.6352、攻撃依存属性11.55、flat1.5。
- 闢獣I最大attack170、物理11.312、攻撃依存属性11.22、flat1.5。
- 黒蝕II基準BEFORE/最大OVERCOME：最大attack175、物理12.0672（克服会心を含む）、攻撃依存属性11.55、flat1.5。
最初の先頭Hit指標を全射総計へ昇格させない。既存明示命中列は同じconsumerからcontactSequenceへ渡る静的確認。今回はLBG公開入口/保存AB/全射列を再実行していない。

証拠ammo-condition-before/after.json、tools/skill-ammo-condition-proof.cjs。前後の原典/旧証拠保持。差分はAdapterとbundle、証拠/監査記録。共通engine/既存Formulaに係数を重複追加していない。

## 次の適用契約

心眼：原典は傷前物理肉質44以下、攻撃乗算。現公開対象の肉質に『傷前値』を明示する契約を閉じる必要がある。切断/打撃/弾を各Hitで選ぶため武器代表肉質で一括判定しない。
飛燕：memo/27.phpのHit別一覧と採用技IDの対応が必要。HH重ねがけ、SA覚醒追撃、CB斧追撃は明示非対象。技名やジャンプ風の見た目から対象を作らない。
鈍器：既存係数と斬れ味閾値は一致。攻撃倍率をB×Mへ置く案と、特殊斬れ味時無効の対象状態契約を採用資料で確定する必要がある。GL砲術順序のowner回答とは別に扱う。
資料：https://kuroyonhon.com/mhwilds/program/skill.php / https://kuroyonhon.com/mhwilds/memo/27.php

GL砲術は回答待ちを維持。新しい大量テスト/CI/Safari操作/commit/pushなし。
