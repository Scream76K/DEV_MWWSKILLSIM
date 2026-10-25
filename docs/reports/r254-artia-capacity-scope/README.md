# 装填数復元の範囲（計算未実装）

Owner 2026-10-25 22:43 UTC: 「アーティアⅡと巨戟アーティアのみに復元ボーナスとして装填数がありますね」。ボウガンに限定した対象範囲の指定。増加量や弾種の新規採用ではない。

通常Ⅱは保存済みMHDBのLBG827「アーティアブラストⅡ」/HBG522「アーティアバスターⅡ」、rare7のID・名称・kind一致で判定。巨戟は既存巨戟判定とボウガンkindの積。Ⅰ/通常rare8/近接/弓は装填数復元の新規選択対象にしない。近接斬れ味は独立維持。

新UIキーcapacity:pendingは未実装選択の記録専用。選択するとARTIA_CAPACITY_RESTORE_UNIMPLEMENTED。対象外の保存指定はNOT_APPLICABLE。旧共用sharp:*はボウガンの場合だけ装填数の旧指定として同様に拒否し、旧JSONや選択値を書き換えない。UI/detailで+30/+50を装填数として表示しない。対象外で旧指定があるときはその値を対象外ラベル付きで表示する。

## 最小境界の実行
HBG521/522/523/1157（Ⅰ/Ⅱ/通常rare8/巨戟）の実取得済み原典を使用。各新キーと旧キーsharp:Iの理由・選択値保持・実UI選択肢とcalcBuildのUNAVAILABLEを検証。正常火力の再検証やA/B再実行はしていない。Ⅱ/巨戟で実弾数が増えるという証拠ではない。

records.json: 521/522はr253-base-artia-sourceの保存原典、523はr254-artia-rare8、1157〜1159は既取得/tmp/mhdb-weapons-1000.jsonキャッシュ。今回通信/新規測定なし。巨戟キャッシュの取得時刻は今回確認できない。既存consolidateArtiaFixedVariantRowsを使用し、stats/skills/結果上書きなし。

再現: CAPACITY_SOURCE=docs/reports/r254-artia-capacity-scope/records.json node tools/artia-capacity-scope-proof.cjs
実行ベース975a8f59a3b10eeab9bce298ef5ccff7e9288a4e + index.html変更。result.jsonに実行index/原典SHA256を保存。ハーネスを/tmpから同一内容で保存。

計算未完: 弾種ごとの増加量・上限・適用先は有効化していない。CB砲弾装填スキルおよび生産同属性素材による属性弾装填数とは別責務。
