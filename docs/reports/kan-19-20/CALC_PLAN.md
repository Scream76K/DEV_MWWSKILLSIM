# KAN19 計算状態契約・index統合案

担当frieren（フリーレン）01 CALC。ヒンメルindex専有、stark UI担当。新規element-state.jsとtests/kan19-element-state.test.cjsだけ製品/試験編集。HEAD fb6d82cd525da9273af10ac6b719f330208608c5 / codex/integrate-r249一致確認。Technique DB/既存数値変更なし。

## 契約

window.MHWElementState / CommonJS exports: fromRecord, fromValue, applySkill, pendingReason, hpElement, unknown。

State: element:number|null, elementType:string, elementKnown:boolean, typeKnown:boolean, elementStatus:KNOWN/UNKNOWN/CONFIRMED_NONE, elementReason:string|null。

- null/undefined/空文字/boolean/NaN/負値を0へ変換しない。
- fromRecord(w,{artia:true,type:'dragon'})のspecials:[]はUNKNOWN。固定Artiaの欠損はtemplate typeKnown=trueでも基礎数値不明。
- 通常specials配列明示空、矛盾するelements無し、選択typeなしならCONFIRMED_NONE。全field欠損はUNKNOWN。confirmedNone:true指定にはevidence文字列を要求。
- 明示0+有効typeはKNOWNで属性強化計算の対象。確定無属性noneは0を維持。
- 状態異常登録値はUI用に保持。hpElementのみpoison/paralysis/sleep/blastを0へ変換。普通属性強化を状態異常へ適用しない。
- type不明/複数候補/選択typeのレコード欠損は保留。raw-only属性は単位推測しないためELEMENT_DISPLAY_VALUE_MISSING。
- applySkillは既存calcElementSkillのmult/addを受け取るだけ。ゲーム数値表を新設しない。
- pendingReasonは旧finite数値入力の校正経路を壊さないが、elementKnown=false/typeKnown=false/nullは保留。

## root専有index修正箇所

CSS等で行位置が動くため以下の関数名を一次locatorとする。

1. scriptとしてelement-state.jsを実アプリscript前へロード（既存JSDOMはlocal scriptを後evalするため初期呼出し順も確認）。
2. mhdbRecordElementValue: 属性レコード値未提供はnull、明示display0は0。単位未確定rawだけからdisplay値へ読み替えない。Artia複数候補のmax拾いでtypeを捨てる構造は、selected type/provenanceと別問題として保留。
3. artiaFixedRecord: elementStateを保持。consolidateArtiaFixedVariantRowsの攻撃/会心分類と値を変えない。
4. artiaFixedVariantStats: attack/affinityが有限ならそれらは保持し、element nullだからvariant全体をnullにしない。固定属性状態のみunknownとする。Number(v.element)はnullを0にするため禁止。elementTypeはテンプレ指定としてtypeKnownに残すが基礎数値既知の根拠にしない。
5. weaponElementInfo/weaponElementInfoFromRecord: 通常武器はmoduleからstateを取得して既存value/typeに併記。複数候補先頭自動採用を防止。status kindもUI蓄積値として維持。
6. calcBuild: fixed/normal stateをstatsへコピー。復元elementをunknownへ足さない。elementComponents.weaponBase=nullを保持。calcElementSkill→applySkillでnullのまま保留。attackTrue/affinity/defense経路は保持。
7. bonusDamagePendingReason: 現activeBonusEffects==nullの早期returnより前にMHWElementState.pendingReason(st)を確認。ここを共有すればdamageForStats/genericStatsFromCalcState/standardGroupPowerPlan/evaluateComboRouteも保留理由へ到達する。元のシリーズgateを削除しない。
8. comboDamageContext: Number(st.element)||0を作る前にpendingReasonを検査。既知状態異常はhpElementのみ0にする。
9. bowPowerForStats/hbgNormalPowerForStats/chargeBladeStatsFromCalcState/standardPowerForStatsSingleHealth: 状態条件や特殊handlerの別理由に隠れる前にelement unknownを確認。未知属性で物理だけを全体のpower/DPSとして返さない。
10. damageFromParams: 人の明示数値入力・旧校正fixtureは保ち、属性null/unknownタグ入力は拒否。固定/純物理成分の単体計算は対象依存を明示した場合のみ例外。既存ダメージ式/丸めは変更しない。
11. compareSnapshot: element:Number(st.element)||0を廃止、nullと状態4字段を保持。power.normal/maximumは保留null、レポートpowerIndex/相対指数に流さない。復元fingerprintにもelementKnown/typeKnown/status/reasonを含め、元のnullと理由まで確認する。
12. aiBuildData: statsはnull/stateを維持。weapon.element||0のAPI上位fieldを計算済み属性と誤認させない。mainのst.element/st.elementType/stateを使うか、API metadataを未提供nullと区分する。comboEvaluation.contextもunknownを0化しない。
13. createBuildComparisonReport/AI ranking/装備提案: 属性不明candidateを全体damage/power/DPS順位に使用しない。attack/affinity/defenseの個別表示は維持可。旧cache state false/nullの排除も必要。

## build-relative-comparison.js（root専有）提案

現在valid(number)はnullを拒否しているので数値の0とnullを混同する直接不具合なし。ただしconsumerが先にnull→0すると防げない。unknown stateタグをreference/candidateへ渡す場合、total/elemental（全体/属性）を拒否しwarningsへ理由を保持。physicalだけ計算できても全体比較READYとしない。affinity個別deltaは既存契約で維持。技数値の独自再計算不要。

## RED/GREEN証拠

新規11テストの初回:1成功/10失敗。実index missing→0、calcBuild60、AI60を期待nullと比較して失敗した。module作成後8成功/3失敗。残り3はroot専有index統合を必要とする。module7契約テストはGREEN、explicit0既存index確認もGREEN。

fixture: MHDB1139/1140/1141の取得済み主要字段とdeco207を使う限定ハーネス。期待attackTrue232/aff10は条件fixture（見切り無し）で、オーナー画面会心22を再現した主張ではない。ライブユーザーstate取得・元動画照合・正しい基礎属性値確定は未実施。
