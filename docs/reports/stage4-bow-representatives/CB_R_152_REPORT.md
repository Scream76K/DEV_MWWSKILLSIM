# CB R四技 152成分分離接続（独立レビュー待ち）

Rプリセットはreview01a19527-8d38-7762-80fe-f8aea9620868で限定受入済み。今回変更はMHAttributeConversionMixedScope.impactTechniqueIdsへ既採用ED1/ED2/FOLLOWUP_AEDを追加する1箇所のみ。既存CB_AEDを維持。adapterの公式IMPACT判定、OBSERVED爆発根拠、資源計画、axeBoostHits出典照合を変更せず通す。165・他技・未知技を許可していない。

成分分離契約Sentinel_0a16b323a9488191bc7a88b798b2204bに基づく配線修正。新しいMV/爆発数/消費/属性係数なし。榴弾は152非適用、採用本体/斧追加の武器属性だけ既存+180とcapを一度使用。数値源複製なし。

## 実行

JSDOM・回収実DB・KOTATU_CB_01の実装備を変更せず、テンプレ読込ボタン→公開Rプリセットchange→通常最大calcBuild→同内容2保存→読込/共有比較。盾ON/斧ON/榴弾/前段CHARGE/通常ビン2/強化0、黒蝕OVERCOME、training-front。通常152OFF/最大ONを元条件のまま使用。

変更前cb-r-public-final.jsonは最大ATTRIBUTE_CONVERSION_BODY_SCOPE_UNSUPPORTED、exit1で保持。変更後cb-r-152-connected.json、exit0。

- 通常2200.5296、最大2678.2256、両側complete。
- 両OFF対照の最大2622.1756。通常channelは丸ごと同値。
- 最大25属性成分：flat差+180・152効果適用1回を各成分でassert。物理/榴弾の残29成分は対照同値。
- ON/OFFでexecution/finalState同値。ビン2→0、直前CB_FOLLOWUP_AED。
- 保存2件読込・現在共有条件比較と全保存内容/現在条件不変。異装備A/Bではない。
- 開始ビン1.5の不足対照は両側incomplete、完成総計なし。

未知技/165への拡張がないことはallowlist差分と既存predicate不変を静的確認。今回未知入力注入を実行したとは扱わない。実機/Safari/F01故障注入/全回帰/別盾斧ビンは未実行。H盾突き爆発とR/H時間比合成は別残件で、R成功はミックス基準完成ではない。旧ログ・他未コミット成果を保持、commit/pushなし。


## 独立受入
review01a19529-ca94-7711-9dc4-9605c0967c44：限定受入可、必須修正なし。元条件2200.5296/2678.2256、OFF対照2622.1756、25属性成分+180一度・29物理榴弾不変、同内容2保存、ビン2→0/不足1.5総計未算出を受入。ミックス基準完成ではない。
