# 94 通常千々矢限定接続

承認 Sentinel_2f2bf988ab1481918b70b96044f24d1a (2026-10-29 22:43 JST)。OWNER_APPROVED_PROVISIONAL、69併用積は直接実機未確認。
既存BOW_THOUSAND_DRAGONS.sourceFormula.pierceUpを唯一係数源とする。正規ID94/名称/Lv1のみ。既存6Hit・1射・無属性・NONEビン・CRITICAL・同部位を維持。算出物理(attackflat含む)に1.05を1回、69とは各1回乗算。属性/部位耐久/他技へ拡張しない。
adapterの限定許可と専用consumer引数、bow-reference.thousandDragonsの物理倍率のみ変更。既存射撃1.1・距離1.0・通常最大独立維持。
公開JSDOM calcBuildでなし/94/69Lv2+94、Lv2不正の専用guard、NEAR対象外を確認。攻撃5・挑戦者1・会心あり・flat非ゼロ。保存2件の通常読込/共有比較/復元不変を確認。
初回は合成護石4スキルが既存保存上限で切り詰められ保存比較失敗。挑戦者を合成武器へ移した最終入力でexit0、製品修正なし。両生ログ保持。実装備成立/実機/全体回帰未確認。
数値/コマンド/最終hashは thousand94-execution.json、差分は thousand94.patch。69既存証拠を全回帰成功へ読み替えない。
根拠: https://macarongamemo.com/entry/mhwilds-damage_up / https://physicalpaprika.sakura.ne.jp/programing/MonsterHunter/damage-formula.html / 保存済MHDB id94対象説明。
94欠落→部分、他の貫通弾/竜の一矢経路は未採用のまま。Git操作なし。
