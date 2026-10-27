# Stage3 第2照合・採用提案（ローカル、未commit）

製品基点6c71e818919379b0b0649d2389237470cbe3802f。179行/442rankの原典を変更していない。

## 分類の進展

完全接続1、部分接続56、直接火力非対象76、実入口欠落35、未照合11。

これは「177/179完成」のような進捗率ではない。完全接続の範囲は②採用済み技・有効な明示状態・HP計算、実機verifiedではない。非対象76にも入口判定未整備の行があり、計算可能な76ビルドを証明した意味ではない。欠落35は実際のclassifier/series rule不在・下流イベント不在を確認した行。対象武器が全14であるとは推定しない。

MHDB descriptions/ranksを全行読取し、各行の期待効果と入口を対応。状態異常蓄積/ビン追加は非火力へ雑に落とさず、状態異常/付与経路の欠落として別扱い。防御118は雷耐性変換への間接入力があるため非対象にせず部分接続。弾導強化53はLv3にHP効果があるため非対象にしない。series/groupは通常スキルと同じ名前許可へ混ぜない。

### 完全接続にできた行

超会心22 Lv1..5。`calcCriticalBoost` → Adapter criticalBoostLevel/reference criticalMultiplier → 下記消費先。

- GS/LS/SNS/DB/HAM/HH本体/LAN/GL本体/SA本体・採用追撃/CB本体/IG本体：sourced-physical-formula → damageFromParams → criticalMultiplierForState。
- Bow：BowReference.standard/techniqueの物理期待会心。
- HBG/LBG通常弾：BowgunNormalReference.shot、属性弾：BowgunElementReference.firstHit/contactSequenceの物理部分。
- CB SAED本体：ChargeBladeEngine.resolveTechniqueDamageへcriticalMultiplierを渡す。
- GL砲撃、CBビン、HH音波/固定、HBG竜撃弾は会心なし。effectStagesでaffinityを除外、またはNO_CRITICAL専用式が不使用。属性値へ超会心を重ねない。

基準/最大で同一係数表、会心率だけ各channel入力。Lv1..5の1.28/1.31/1.34/1.37/1.40、負会心は既存0.75。各武器の未採用技や未解決入力をcompleteへ昇格させない。

攻撃・見切り・5属性強化等は共通本体経路と複数特殊式を追跡したが、全特殊成分/上限/範囲の残点があるため今回は完全接続へ上げていない。

### 修正した別の入口欠落

MHDB105気絶耐性Lv3は直接HP効果がないが、旧AdapterはSKILL_EFFECT_NOT_PROVENで両channelを停止した。固定状態のHP計算に数値変更のない通常スキル37件を、既存INTERNAL_SKILL_ADOPTIONへMHDB ID・最大Lv・原典参照付きで追加した。対象名は新差分とmatrixのID_LEVEL_VALIDATEDを参照。IDやLvを無視した一律unknown許可ではない。GL unreviewedSkills/HBG竜撃allowlistにも同じconfirmedNonDamageを使用し、同一の非火力判定を入口ごとに拒否し直さない。

最小実行証拠utility-before/after.json：同じGS契約入力でなし→375.73/375.73、気絶耐性Lv3は修正前両側未算出→修正後375.73/375.73、Lv4は拒否を維持。合法実装備のStage4検証ではない。37件すべてを実入力テストした意味でもない。

### 新たな具体欠陥（係数未採用のため未修正）

会心撃【属性】82：共通createSourcedElementalFormulaはcriticalElementLevel>0のbooleanだけをdamageFromParamsに渡しcritBonus=0。そのため共通経路のLv1/2/3は同じ物理基準の1.25期待会心となる。MHDBの段階差を表現できない。弓専用Lv表は別にあるが、他武器への無断流用をしない。CB SAEDは明示的にELEMENT_CRITICAL_BODY_CONNECTION_PENDING、属性弾もinteraction拒否であり、この2経路を適用済みとは数えない。

弾導強化53：MHDB rank3に適正距離での威力上昇が明記されるのに、resolveSkillApplicabilityはLv1..3をnon_damageとしている。属性弾Lv3は別guardが止めるが、通常弾/弓では追加効果の下流がない。既存採用係数の出典を確定してから接続が必要。

## ユーザーへ一度に確認する2提案

### 1 黒蝕一体と狂竜症

原典：https://wilds.mhdb.io/ja/skills (id106、id18) / https://kuroyonhon.com/mhwilds/program/skill.php / https://kuroyonhon.com/mhwilds/d/dame.php 。補助加算グループ記録：https://kuroyonhon.com/mhwilds/memo/21.php 。現在版実測ではない。

|有効ランク|部位数|感染前|感染中|克服後|
|---|---|---|---|---|
|黒蝕一体Ⅰ|2〜3|攻撃+0、会心+0|攻撃+0、会心+0|攻撃+0、狂竜症克服会心+15%|
|黒蝕一体Ⅱ|4以上|攻撃+0、会心+0|攻撃+10、会心+0|攻撃+15、狂竜症克服会心+15%|

ⅡはⅠへ重ねず上位rankで置換。+15攻撃は+10と+5の合計で、さらに+10を足さない。克服会心15%は狂竜症由来の共通効果で、黒蝕の独立した追加15%ではない。無我の境地Lv1/2/3は克服時だけ更に3/6/10%（合計18/21/25%）。無我単独で感染が起きるとはしない。

**提案する入力/式**：黒蝕発動をMHDB id/rank/部位数で確認し、基準側の状態は感染前・感染中・克服後から明示選択。最大側は克服が成立可能な条件として克服後を選ぶ。感染前と感染中を同時加算しない。攻撃加算は既存攻撃乗算後の加算段階へ1回、会心はcalcMaxAffinityの旧同名分と置換して1回、最終会心上限100%。属性値には加算しない。外部感染源だけの自動判定やモンスター名正規表現をこの新契約の根拠にしない。黒蝕がない他感染源の対応は別入力として後続整理。

質問案：『黒蝕Ⅰは攻撃加算なし、Ⅱは感染中+10／克服後合計+15、克服会心15%と無我の追加3/6/10%は一度だけ、という表を根拠付き暫定採用してよいですか？ 基準の感染状態は明示入力、最大は成立可能な克服後として接続します。』

### 2 灼熱化の明示発生回数からの総計

原典：https://wilds.mhdb.io/ja/skills (id71)、https://kuroyonhon.com/mhwilds/program/skill.php 、対象モーション https://kuroyonhon.com/mhwilds/memo/32.php 。既存ScorchReferenceは上位限定、POST_1.03出典、実機未検証。

- 火竜の力2〜3部位＝灼熱化Ⅰ、4以上＝Ⅱ。上位のみを今回接続。
- Ⅰの1回＝固定20＋火属性600表示値、Ⅱ＝固定40＋火属性1200表示値。既存式内では600/10=60、1200/10=120を用いる。
- 火属性強化Lv0/1/2/3の既存倍率1/1/1.1/1.2、表示加算0/40/50/60を使用。1回は固定値＋(表示火属性×倍率＋表示加算)/10×火肉質/100。会心・武器攻撃・斬れ味を掛けない。
- **基準/最大それぞれ明示した実発生回数**を掛け、本体へ追加する。未入力と明示0回を区別。部位・火肉質は明示した対象共通条件、対象HitはTechnique DBの既存scorch適合判定で確認する。未確認技を自動適合にしない。
- countはHit数/部位数/装填数から生成しない。実発生回数として入力した値の合計なので、確率1/3やクールダウンからの期待回数をさらに掛けない。実発生の観測/明示条件を確認できないcountは『実測』とは表記しない。
- 白熾の奔流併用、火肉質0、下位、他の未採用属性バフ相互作用は今回の既存式範囲外。これらを黙って同じ式で正常計算しない。確率期待回数とDPSは別機能。

質問案：『上位の灼熱化Ⅰ/Ⅱについて、既存の固定＋火属性式を、基準/最大それぞれ明示する発生回数で合算する接続を進めてよいですか？ 時間や回数を自動補完せず、既存対象Hit・正の火肉質・白熾の奔流なしの範囲で、本体と追撃を含む総計を返します。』

この2モデルは提案であり、今回まだ製品へ採用していない。新しい係数の無断採用、全件完了、実機verified、commit/push、③完了宣言は行っていない。
