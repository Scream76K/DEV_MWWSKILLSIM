# 承認済みver1.04属性上限・条件内訳
基点6c71e818919379b0b0649d2389237470cbe3802f＋ローカル差分。commit/pushなし。
原典 https://kuroyonhon.com/mhwilds/memo/31.php 、owner承認 Sentinel_55d857b4115c81919a1531bd3457ae8c。現行版実測VERIFIEDではない。

## 接続
index.html ELEMENT_CAP_RULE：武器上限max(B+400,2.3B)。equipmentから共通engineへ供給、効果計算後・Formula/肉質/会心前に適用。elementComponentsはuncapped、capBase、capLimitを保持し倍率/normalFlat/conditionalFlatを潰さない。
standardPowerConditionPlan.maximumElementComponentsが災禍倍率と連撃/吸収flatを別々に渡す。Adapterは倍率ratioとconditionalFlatを別L3効果にし、既計算element差分をflatとする旧経路をこの群で置換。暗黒系ダークアーツ競合は既存pendingを維持し新採用しない。
SA強属性ビンの既存効果と覚醒追撃の既存属性効果にはelementCapBaseScalingを付け、実際に適用する成分だけcapBaseを乗算する。通常剣/斧Hitを同じBへ統一しない。数値は既存ビン/追撃DBのまま。
BowReferenceはCMを基礎×倍率部分へ適用しflat不変、その後capLimit。共通GS CMはL3乗算後のcap。会心属性期待値はFormula内の後段で既存どおり一度。
BowgunElementReferenceは弾基礎×完成攻撃×既存武器補正から上限を作る。flat加算後、肉質/会心前に制限。+400を流用しない。HBG/LBGレコードの共通継承データを使い、順序減衰は物理のみ維持。

## 最小証拠
skill-element-cap-proof：GS契約入力で火強化3＋災禍3＋連撃5＋吸収3。元属性50は未cap458→450、元属性1000は1940で上限2300未到達。全属性componentのappliedElementをassert、基準は元属性×1.2+60のまま。最大倍率1.56、条件flat320を別assert。
属性弾専用式2ケース：攻撃100/弾Lv1、属性倍率1、flat0/500、肉質30、会心100・会心属性1.21。上限前属性20/70、上限46、結果7.26/16.698。会心をcap基礎へ含めない。
弱点特効公開GS境界4ケースも共存再確認、表示最大保持。WEX+会心属性同時の全武器実行ではない。
SA/Bowの上限境界は今回静的接続確認のみ、専用最小実行は未完。原典未採用技の解禁なし。CI/Safari/実機なし。

## スキル監査
五属性強化50/91/127/121/41：共有resolver→通常武器/属性弾→上限→会心可能属性成分の接続。
連撃95：最大の攻撃/属性flat。ボウガン属性flat0という既存表を維持。
災禍13：最大の乗算をflatへ変換しない。属性弾の倍率も独立。
吸収133：最大3回成立という既存条件のflat。発動回数入力や時間期待値を新設しない。
上記の共通経路断絶は修正。特殊成分と他series競合まで包括完全とはしない。ダークアーツとの競合、属性変換/耐性変換の属性弾対象外、未採用特殊成分は別の明示範囲。
次：SA/Bow専用上限境界の最小確認、条件会心残り（抜刀/濡れ/狂竜外部条件）、射撃/ビン許可群。
