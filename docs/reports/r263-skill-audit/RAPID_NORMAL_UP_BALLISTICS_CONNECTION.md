# 通常Lv1速射: 通常弾強化6/弾導強化53

承認 Sentinel_9421e719eda08191818a70a24efe9c2f (2026-10-30 00:09 JST)。新係数なし。通常弾強化は既存LBG_NORMAL_REFERENCE_RULES.normalUpを参照、弾導強化は既存MHCommonSkillDamageRules.ballistics.criticalRangeAttackAddsを参照。adapterが完成attackへ弾導加算を一度加え、専用consumerは通常弾強化と速射強化をそれぞれ物理へ一度。通常/最大の攻撃・会心差は既存計画。
正規ID/名称/Lvを限定検証。5Hit/1消費/明示開始条件/適正距離は従来のまま。距離拡張を推定せず、First/Force/抜刀/他弾種は引き続き保留。

最小公開JSDOM: 合成raw90/aff10、攻撃5・挑戦者1、弾肉質80。23のみ→6併用→53各Lvを確認。各HitのattackとnormalUp内訳、通常最大総計、消費1。6Lv2/53Lv4は試験DBのLv上限だけ一時拡張して固有guardまで到達し拒否を確認。実装備の成立検証ではない。保存2件の通常復元・現在共有条件の比較・現在状態不変を確認。

旧rapid23証拠のF01途中失敗は旧hash限定。今回はengine/min8/bundleと消費処理を変更せず、同じ注入試験は反復していない。全体回帰/実機/実ブラウザ未実施。非正規化参考値。
製品3ファイルの限定差分rapid6-53.patch、生出力rapid6-53-after.json、全hash/コマンド/exitはrapid6-53-execution.json。初回harness trace期待の失敗と修正前拒否を保持。
分類71完全/14部分/0欠落は据置。23の適用範囲を追加、53の竜撃弾適否等の別残件は未解消。commit/push/統合なし。
