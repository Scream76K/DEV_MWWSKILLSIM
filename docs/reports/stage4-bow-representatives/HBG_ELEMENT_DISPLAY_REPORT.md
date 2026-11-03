# HBG属性弾比較表示の接続是正（限定受入）

160明示OFFの計算は独立review 01a19571-593b-71b4-af4e-5dd3525c3057で限定受入済み。本差分は表示・件数集計のみ。

原因：renderCompareTable/comparisonCoverageSummaryは旧STANDARDのpowerと相対比を参照し、共通Pipelineの属性弾総計が成立していても通常0/2等を表示した。同じ画面のPipeline行とは異なる計算経路だった。

HBG_EXPLICIT_CONTACT_SEQUENCEの診断を持つHBG行について、実行completeかつmetric availableかつ有限値の側だけ成立として集計。HBG属性弾の全比較行が該当するときは、旧指数表を表示せず専用の非正規化実ダメージ表/停止理由/件数を表示。基準100/平均化/時間推定はしない。CB合算・他武器・非該当経路は変更なし。共有条件による比較の計算本体は未変更。

公開実テンプレKOTATU_HBG_01、火炎Lv1/3接触/訓練場正面/適正距離/特殊mode0/容量2/満タン初射を維持。同内容2保存。両OFFは通常89.35344/最大112.2421344で通常2/2・最大2/2。共有通常OFF/最大ONでは通常89.35344、最大BLADESCALE_OFF_REQUIREDで通常2/2・最大0/2。保存内容・現在装備・共有条件不変。画面の丸め値89.4/112.2と生値を区別。

RED red.json exit1は旧件数表示に対するassert失敗、GREEN green.json exit0。受入済hbg160-off/final-shared.jsonと全計算channel/共有比較行が厳密一致することもJSON読取りで確認。製品計算・adapter・Formulaの変更なし。実行はJSDOMの公開UI/計算/保存比較、実機/Safari/F01注入/全回帰/異装備比較/LBGは未実施。ON効果採用や基準属性弾の全条件完成ではない。

証拠：hbg-element-display/incremental.patch, red.json, green.json, manifest.json。commit/pushなし。

独立review 01a19574-0ad3-77b6-b187-cf49a961498dで限定受入。後続は末尾を「非正規化計算値を表示時に丸めています」へ文言のみ訂正。green.jsonは訂正前index 0d90e68062f6a8418fca1873a5da504d95eb2e962c04f2c7df424f9a9db83d61での実行証拠。数値/条件処理は不変、HBG再実行なし。
