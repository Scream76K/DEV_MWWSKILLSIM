# 通常弾復元の実保存A/B接続

実行製品SHA: 08d909770c2b7b8f73117cf9c073d75bb93024d5（製品変更なし）。result.jsonにindex/adapter SHA256。原典は既存r254-artia-capacity-scope/records.jsonのHBG523。stats/skill/plan/result上書きなし。

A=capacity:I 1枠、B=同2枠。公開calcBuild→saveNamedBuild→runBuildCompare→実rendererを一度通す。Aの両ch Formula state.magazineCapacity=3、B=4、capacityEvidence.bonus=1/2をassert。各単独/比較のfinite available complete値は118.5597で一致、容量だけでは1射威力不変。比較後Bの装備snapshot・比較UI条件・復元後武器投影全体が比較前と一致。表示118.6を確認。preserveCombo:true共通条件の製品仕様を変更していない。既取得の容量単独境界テストを再実行せず、この保存接続1組のみ。

## 他弾種・既存実装照合（静的、追加実行なし）

- 通常弾: hope-hammer-browser-adapter.js resolveReferenceState / referenceFormula と BowgunNormalReference.shot が装備・弾種原典容量を共通Pipelineへ渡す。現復元の対象。
- 散弾: index.html:5689 HBG_SPREAD_AMMO_2はsource-confirmed MV15.6/6Hit、ただしSPECIAL_FORMULA_AND_EVENT_COUNT_PENDING、OFFICIAL_BASELINE_VERSION_AUDIT_PENDING、WEAPON_AMMO_APPLICABILITY_PENDING。hits空、special AMMO_PHYSICAL。HBG523原典にはLv2容量3、LBG828にはLv2容量2あり。adapter referenceKind列挙は通常弾のみ、非reference空hitsはTECHNIQUE_HITS_NOT_FOUND。現存の通常弾式をそのまま散弾へ転用する承認はない。最短の全1射接続候補だが、距離/散弾強化/武器倍率と資料採用範囲確認が先。
- 貫通: 同じr49のHBG/LBG_PIERCE_AMMO_2はmvPerHit12、hitCount:null、VARIABLE_HIT_COUNT_POLICY_PENDING。他弾と同様に原典Lv2容量はあるが、総計用Hit数を創作不可。最小候補は明示1Hit参考契約であり、全1発計算の完成ではない。
- 属性弾: bowgun-element-reference.js:firstHit（4-14行）はHBG_ELEMENT_FIRST_HIT_REFERENCEを読む。index.html:8814-8816の独立手入力form経路。Technique DBはEVIDENCE_GATED / UNVERIFIED、FIRST_HIT_ONLY_NOT_WHOLE_SHOT。共有calcBuild/保存比較へのreferenceKind登録なし。HBG523/1157原典ammoに属性弾はない。既存生産/素材/巨戟別属性弾表を正式入力へ解決する契約が必要で、武器属性0を属性弾0とみなしてはならない。先頭1Hit限定なら次の候補だが、1発総計へ昇格不可。
- 竜撃弾: hbg-wyvern-reference.js:calculateは既存2Hit暫定式あり。index.html:4163 hbgWyvernComboDamageは旧専用入口で巨戟/bonus効果を明示拒否。実523/1157原典にwyvern容量なし。今回の装填復元から接続する合法入力が揃わない。

## 資料・未確定の絞り込み
2026-10-25に https://www.phantombrawlers.com/mhwilds/Artian のReinforcement Bonusesを再確認。Capacity Boostの一般値とは別に、一部弾種で効果が低く要調査という注意が残る（取得表示627行）。そのため麻酔/補助/属性などへ一律増加を拡張しない。ページの属性弾容量表は生産/素材/巨戟変異の段階も別記しており、復元と混合しない。

次の推奨順: 散弾Lv2の既存技資料で距離・スキル適用式と採用範囲を照合→根拠が揃えば6Hit限定reference接続。容量例外は資料/実測の弾種別裏付けが必要で、オーナーへ数値を推測で選ばせない。巨戟種別上限は今回変更なし。新機能・係数採用・gate解除・bundle変更なし。
