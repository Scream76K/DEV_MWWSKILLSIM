# LBG実装備の共通効果受渡し診断

読取診断。計算修正・追加実行なし。既存公開ログ `lbg-rapid3-real-final.json` の KOTATU_LBG_01 は引き続き BLOCKED。限定速射計算の独立受入（01a19195-5828-77ad-93d3-e5bb4356ed1a）と実装備成立は別。

## 実発動IDと入口

hope-hammer-browser-adapter.js:196 の LBG_RAPID:SKILL_COMBINATION_NOT_ADOPTED が以下の5件を拒否する。後段producerへ到達する前の両channel停止。

|ID/実Lv|既存計画・計算段|通常/最大|診断|
|57 弱点特効5|MHWWeaknessExploitForHit、adapter:598–615,765–766|両側とも各接触の射撃肉質・傷状態に依存|入口拒否に加え rapidHit 呼出:807 に接触WEX加算なし。通常弾の既存接触resolverを速射5Hit同部位へ渡す必要。最大会心表示97をそのまま使うのは不可|
|99 渾身3|index:1908–1920 / PASS11_CONDITIONAL_AFFINITY.md:5–11 / adapter:725|通常0、最大既存成立済み+30会心|共通最大会心計画は既存。速射入口の許可不足。時間/スタミナ生成は不要|
|120 巧撃1|index:7809,7880–7888 / adapter:725|通常0、最大回避成功バフ成立済み+10攻撃flat|共通attack計画解決済み。速射だけ再係数採用する理由なし|
|95 連撃1|index:7890–7896 STANDARD_BURST_SOURCE の武器種別表 / adapter:725|通常0、最大5Hit成立済み+6攻撃。本入力は属性0|LBG用表は既存、5発を経時積算して途中発動させる契約ではない。共通計画受渡し不足|
|131 根性【果敢】|index:7116,7163,7236–7239 / adapter:725|現在BEFORE、両側基礎攻撃×1.05。AFTERは既存×1|parentヌシの魂/rank1/4部位/required3の解決済み計画。入口のactiveBonus検査でも拒否。本体効果なので非火力扱いにしない|

その他11件：144挑戦者5は入口既許可（最大attack+20/会心+15）、3見切り3/22超会心4は共通key許可、6通常弾強化1/23速射強化1は専用許可。38鎖刃刺撃2は注釈、77回避性能2/108ひるみ軽減1/102回避距離2は確認済対象外。33加速再生Ⅰは鎖刃竜の飢餓rank1/count2/required2の検証済nonDamage計画、71灼熱化Ⅰは火竜の力rank1/count2/required2のbodyEffect:false注釈計画で通過。合計16件（上表5＋ここ11）。

実ログのskills配列が正本。ID列：57,144,38,77,3,120,22,6,23,99,108,102,95,33,71,131。

## 一まとまりの最小案

正規ID/名称/Lvと解決済みcommon planを照合した57/99/120/95、および一意の親名/rank/部位/適用記録が一致する131を速射入口で受け入れる。一般conditionalAttack全部や全系列の包括許可にしない。未解決planは停止。131をfixedEntrySkillへ非火力登録しない。

共通resolveEffects（adapter:704–725）が作るattack/affinityを referenceFormula:740 のchannel別stats→rapidHit:807へ一度だけ渡す既存経路を使用。実ログの攻撃内訳は基礎245、根性1.05、通常257.25、最大+36=293.25。これはproducer値であり未実行の速射成功値ではない。新たな専用attackflat/渾身/根性係数を作らない。

57だけは通常弾の既存wexFor(part,'pierce')を同部位5接触それぞれの会心に一度加算し、100%上限と傷条件を共有する。共通最大resolverでWEXを除いた処理（:598）を維持し二重加算を防ぐ。現raw最大表示97は全傷仮定を含むためconsumerの期待値へ流用しない。

共通効果の係数/評価条件はすでに採用済みであり、今回の5件に新ゲーム数値・速射固有倍率の採否は不要と判断。速射固有のFirst/Force射撃単位、他弾種、反復、チェイス等は別の未採用境界として維持。最小検証案は実テンプレ1件の公開normal/max＋保存共有比較、WEX有効/非有効接触対照、未知/不正rank拒否。今回は未実行。

## 表示のみの訂正

速射選択肢/説明を「Lv1、または素Lv2＋明示通常弾強化火薬の実効Lv3・単発」に訂正。素Lv3/一般Lv2まで許可しない。`lbg-rapid3-ui-wording.patch` と manifest参照。既存実行は文言変更前hashの証拠で、再実行なし。
