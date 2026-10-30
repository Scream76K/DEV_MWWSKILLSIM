# ID87 採用特殊consumerの静的追跡

製品変更・追加テストなし。従前の「特殊reference追跡不足」を以下で補い、ID2/6と同じ採用範囲の静的基準で87を部分→完全へ訂正。ゲーム仕様の新規承認や実機verifiedではない。

## 共通入口
index.html:7790–7795 standardPowerConditionPlan はLv1〜5/attackComponentsを検査し、既存STANDARD_HEROICS_SOURCEを条件攻撃倍率へ。通常未発動、最大低体力。adapter resolveEffects の conditional-attack-multiply は最大だけ既存倍率を生成。
engine.cjs:134–158はcomponent effectTargets/effectStagesで対象を選び、weaponBase×normalMultiplier＋normalFlatとして計算。209行で適用後statsとattackComponentsを各Formulaへ渡す。係数は各consumerに複製されない。

|採用成分|L2の対象指定|適用後consumer（adapter行）|数値の消費|
|---|---|---|---|
|GL通常/溜め/通常フルバースト|real-technique-one-hit-adapter.cjs:37 physical/attack|583 shellingFormula → gunlance-shell-reference.js:31–44|基礎×倍率×砲術＋flat。火成分には攻撃倍率を使わない|
|CB榴弾/強属性ビン|同:93 physical/attack または element/element|584 phialFormula → index.html:5321–5336|榴弾はattackComponents、強属性はdisplayedElement。火事場の攻撃倍率を強属性へ転用しない|
|竜撃弾|同:54 physical/element、attack等|585–590 → hbg-wyvern-reference.js:6–22|基礎倍率とflatを分離、物理のみ攻撃依存。専用火値不変|
|HBG/LBG属性弾|同:54|591–614 → BowgunElementReference|完成stats.attackを物理と攻撃依存属性へ。属性flatは外側。火事場は独立elementAdd/multを生成しないため条件属性guardの対象でない|
|HH承認済みイベント|同:18、固定10だけfixed、それ以外physical/element|615–619 → huntingHornSpecialSourceEstimate|攻撃依存音波/追撃はstats.attack。固定10はattack effect対象外|
|CB SAED本体/榴弾集約|同:54|referenceFormula charge-blade-saed → ChargeBladeEngine.resolveTechniqueDamage|stats.attackをbaseAttackへ一度供給。強属性爆発はdisplayedElement|
|Bow固定射撃/通常弾|同:54|referenceFormula BowReference/ BowgunNormalReference|stats.attackを物理へ供給。武器属性は別値|
|通常本体/SA採用追撃|同:physical component / SA followup|common physical Formula|共通attack倍率を消費。SA高速変形等の別対象制御を変更しない|

## 健康分岐・保存・実行範囲
adapter:722–740 evaluateCurrentは元の通常結果を保持し、満タン枝で火事場/172/逆恨みを除去、低体力枝でフルチャージを除去。両枝が完成した場合だけ技列全体の最大値を選ぶ。共有条件を書き換えず局所skills/stats/weaponを渡す。
直前のconversion-dark-arts-execution.jsonは合成GSの火事場5＋フルチャージ5＋172＋龍変換で通常1144.54、満タン1283.66、低体力1512.57を確認済み。同じ証拠の保存A/Bは雷172/Peakの2buildで、火事場付き龍buildの保存A/B実行ではない。本静的追跡を新しい実行成功と表現しない。F-01/engineは変更なし。

## 残20行の次アクション（既存表の再利用）
- 152/165/172：直前の限定実装は独立レビュー受入済み。今回その3行を自動昇格せず、採用範囲内の残件と証拠対応の分類判断へ渡す。追加の同一テストは不要。
- 7/8/103/85/136/66/86：対象Hit/特殊成分適否の既存未確定点。SAED本体抜刀配列とGL鈍器除外は既に実装済みで再修正しない。新たな対象ONは採用判断が必要。
- 13/50/53/133/137/140/171：竜撃弾等の専用成分の順序/範囲/単位。現時点の提案を採用済みと扱わない。
- 18：黒蝕なし感染の明示入力契約。黒蝕＋無我の既存接続は再調査しない。
- 154/168：暗黒168と満タンの評価契約。172の契約で代用しない。
この範囲で新たに証明された製品断絶はない。古い一般的「特殊未確認」記述を不具合と断定して修正しない。

静的対象hash: `{"index.html": "0dcfac03ec4bddf7845c2875d7ef8f2448d033228469ba188e7c10968c647cd9", "hope-hammer-browser-adapter.js": "a1ae41b04e491368abb2cbf596799d8f12e5c28b08dc8a3f18103fd4459a20db"}`

更新分類: {"火力非対象": 88, "完全接続": 59, "部分接続": 20, "固定ダメージ系・注釈のみ": 6, "欠落": 6}。実装増加0。
