# KAN-22 / KAN-17 二段斬りの限定接続

基点 bb004859390899bf4af9b1f40154490b4e0bc3ee、branch codex/kan17-supported-components。

優先対象は既存Technique DBのIG_DOUBLE_SLASH（二段斬り）。SOURCE_CONFIRMED、2Hit MV18/24・属性補正0.7/0.8を既存レコードから読む。数値や検証状態は変更しない。既存InsectGlaiveBodyHandler→ordinaryComboTechniqueDamage→genericProfileDamageを使用し、エキスなし・猟虫収納に限定。

index.htmlの採用カタログと本体許可一覧へ追加し、追加参考テンプレadopted:ig_double_referenceを用意。旧けさ斬りテンプレは維持。単発・参考・自由・保存比較で同一合計と基準100を確認。未知技混在、三色、猟虫展開は全体未算出を維持。保存復元で明示状態と技IDを保持。保存JSONの形式変更なし。

追加テスト2件は修正前2失敗、修正後成功。テストの復元API名誤りをapplyBuildSnapshotへ訂正（期待値緩和なし）。関連DOM36件、既存IG DOM/Browser7件、計43合格・失敗0・skip0。Browserは既存375/1440pxの操作回帰で、新二段斬りの実ブラウザ操作は未検証。1491全件は指示どおり再実行しない。git diff --check合格。Technique DB定義領域は基点と文字列一致（既存539件の数値変更なし）。HBG竜撃弾未接続、DPS/時間変更なし。

変更：index.html、tools/kan22-double-slash-dom.test.cjs、本報告と証跡。commit/push/公開/Jira操作なし。

保留：強化操虫棍・猟虫成分の回数/状態、CB非SAEDビン成分、HH音波/響玉、GL竜杭等は既存保留を維持。次候補は同条件のIG移動斬り等、既存SOURCE_CONFIRMED本体技の小単位接続。新数値採用はしない。
