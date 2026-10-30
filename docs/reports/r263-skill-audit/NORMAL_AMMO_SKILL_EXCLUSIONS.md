# 通常弾の対象外スキル入口（局所修正）

基点9a0b99b。既存MHDB保存原典のID23は速射、69は特殊弾/指定矢、94は貫通弾/指定矢を対象とする。通常弾へ倍率は適用しない。

adapter resolveSkillApplicabilityで、既存LBG_NORMAL_AMMO_1/2・HBG_NORMAL_AMMO_1/2/3だけを対象に、正しいID/日本語名/LvとNORMAL弾種（LBGはNORMAL射撃）を確認してnon_damageを返す。新係数・新技・全般的な許可は追加しない。Formula側の状態検証とF-01は不変。

公開calcBuildのLBG793通常弾Lv1で、なし=67.49952、各スキルありは修正前EXECUTION_INCOMPLETE、修正後は基準/最大とも67.49952。速射状態は拒否を維持。UIのLv2入力はMHDB Lv1へ丸められるため、未加工不正Lv2の拒否は取得したadapter入力で確認した。最初の修正後実行は、このUI丸めを拒否と期待した試験側誤認で失敗した。製品を追加変更せず、確認する入口を区別して再実行成功。HBGは共有分岐の静的確認のみ。

証拠: normal-ammo-exclusion-before.json / after.json。ハーネス: tools/skill-normal-ammo-exclusion-proof.cjs。以前の守勢差分と監査訂正は保持。全体38/85・部分39・欠落8は据置。

未解決: 83はHAM_MIGHTY_CHARGE_UPPERCUTと原典対象の同一性、181は水耐性×4候補の採用/対象条件。159/163の単位/成分、178の採用済みI×1.2+20/II×1.3+40の加算単位・専用属性/属性弾範囲は推測しない。
