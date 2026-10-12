# Stage6変更一覧

前段階の変更との区別はevidence/before-manifest.jsonを基準とする。既存ファイル更新はindex.htmlの局所CSS10行とBrowserテスト1件の測定方法のみ。既存DB、製品JS、テスト期待値、Stage4/5文書・証跡の変更なし。削除なし。

|変更|理由|
|---|---|
|index.html|参照IDの折返し、理由文字色、外側配置全幅、内部スキル2列の局所CSS|
|tools/r250-stage6-ui-browser.test.cjs（新規）|5幅の問題再現・表示と計算値保護、before既定上書き防止|
|tools/power-change-display-browser.test.cjs|resizeで切断済み旧表を測る競合を修正、現行DOMの幅を測定。期待値は不変|
|REPORT.md / UI_CHANGES.md|結果・再現条件・仕様根拠・未検証範囲|
|DPS_EVIDENCE.md / evidence/dps/legacy-ref-trace.json|14武器不足根拠・旧参照23件の追跡|
|SALADA_FOLLOWUP.md / OCR_FOLLOWUP.md|根拠不足の継続状態と必要取得条件|
|QA.md / REVIEW.md|回帰結果、失敗を含む品質ゲート、独立レビュー|
|JIRA_UPDATE.md|既存チケットの実更新記録・承認依頼|
|evidence/before-manifest.json / before-worktree.tar.gz / git-safety.json|開始時保護と終了時保全照合|
|evidence/ui/|修正前後30画像、contact5画像、測定JSON、RED/GREENログ、CSS案|
|evidence/qa/|全試験ログ、SHA照合、変更前HTMLの証拠用複製、追加visibility切分けハーネスとログ|

正確な相対パスとSHA256、追加・更新・削除件数は [evidence/changed-files.json](evidence/changed-files.json) に記録する。開始時tarは既存未コミット成果のバックアップであり配布・公開用ではない。変更前HTMLは専有QA証跡にだけ抽出し、製品ファイルを置換していない。

Git追跡の変更16件は前段階からの未コミット成果を含む。Stage6で16件を新たに変更したという意味ではない。main/develop/originの参照変更・ステージング・削除0。
