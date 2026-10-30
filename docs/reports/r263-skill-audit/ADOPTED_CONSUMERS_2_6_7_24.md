# 採用consumerの静的照合（新しい製品変更・実行なし）

ID/名前は現行台帳照合。製品adapter b83cee509289cb2ab5cafb9c9877294aa074ff2ac5bf088e774fa5fbfbc560bbを維持。

- 2 散弾・剛射強化: classifySkill→referenceSkills.spreadUp→BowReference→SpreadShotSkill.resolve(SPREAD_SHOT_SKILL_RULE)→対象Hit物理。通常矢・属性非適用。r254-spread-skill-scope/READMEとresultの既存公開証拠で剛射109.593→115.07265、剛連射164.3895→172.608975、属性不変。未採用散弾/Quick等は技gate維持。採用範囲静的完全へ監査訂正。
- 6 通常弾・通常矢強化: 同じreferenceSkills経由、Bow通常矢のみ、HBG/LBG通常弾はBowgunNormalReference.shotのrule.normalUpを各接触へ物理一度。LBGはHBGの既存表を参照。r255-lbg-normal-upの公開保存比較証拠67.49952→70.87449600000001を再利用。静的完全へ監査訂正、未採用モードには拡張しない。
- 7 高速変形: 既存SA/CB変形はevent.techniqueId条件のattack倍率、SA覚醒追撃はexcludedEffectIds、CB放出の爆発はresourceContractの除外IDを消費。ED1 CHARGE、AED SHIELD_THRUST/GUARD派生は既存接続。r262-cb-ed1-halfのAED origin/persistence節を根拠とし、古いunconnectedScope全体を現在未接続と解釈しない。ただしadapterはCB_SAED/CB_SAED_AED_DERIVEDでLv>1を明示拒否。ここは本体/ビンが集約されたreferenceへの入力・前段対応が未解決で部分維持。
- 24 チャージマスター: GS3技はMHGreatSwordChargeMasterDB Lv1/2/3=1.15/1.20/1.25→L3 element multiply、Bow3技はTechnique DB 1.05/1.10/1.15→BowReferenceの基礎×倍率部分のみ、その後flat/cap。r254-charge-master resultとr262-bow-element-basis after、PASS13を再利用。GS既存証拠の属性20.25/24.3/29.7→23.29/27.95/34.15、物理不変。変換152/165併用guard/条件計画合流の残範囲は別、部分維持。

8/103も続けて該当関数だけ確認: referenceDrawCountはBow/弾以外を1へfallbackし、SAED本体の複数Hitに対応しない。explicitAffinityEffectsおよびpunishingDrawは特殊reference対象ONを明示拒否するため、現在誤って全Hitへ適用されることはない。SAED本体配列と入力配列の意味/爆発除外を確定せずfallback1を解除しない。新しい対象Hitを創作して修正しない。

分類38→40完全、39→37部分、欠落8/注釈6/非火力88不変。これは2件の監査訂正で製品実装増ではない。今回新しい期待/実測値なし（上記数値は過去実行値）。新テスト、Git、Safari/元Stage3操作なし。
