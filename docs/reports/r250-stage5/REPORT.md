# r250 Stage5 監査・根拠整理報告

2026-10-11 JST。指定開発worktreeでStage4成果を保全し、UI品質・Technique DB根拠・OCR座標・SALADAを並行監査した。製品コードの修正は0。監査資料の整備を完了したが、実画像golden・正式DPS・映像照合・実機UI品質は未完成。修正優先順位と次の実装範囲はゼーリエ／ユーザー判断待ち。

## 1. 作業環境・保全

worktree `/Users/scream/Projects/DEV_MWWSKILLSIM-r250`、branch `codex/integrate-r249`、HEAD `fb6d82cd525da9273af10ac6b719f330208608c5`。開始時にpwd・branch・HEAD・worktree一覧・差分・statusを確認し一致。追跡変更16、未追跡525、staged0、deleted0。HEADとの差分は以前の統合／Stage2〜4成果を含むためStage5の変更と混同しない。

開始時852ファイルの一覧/hash/status/refsと全ファイル（node_modules/.gitを除く）をevidence/before-manifest.json、before-worktree.tar.gzへ保存。フェルン／アイゼンが独立SHA再計算でmissing0・changed0を確認。最終himmel照合はevidence/git-safety.json。Stage4を含む全既存ファイルを保持し、既存143ファイル・製品/DB/テストを変更しない。既存Git管理情報は操作せず参照を保持。

main/develop/origin/mainは同HEAD、origin/develop `08872bb756f6fd07d0b8626ad2ec472df8141bae`の3先行は維持。原本リポジトリ/GUILDへのアクセス・変更なし。commit/push/merge/rebase/reset/clean/deploy/公開なし。新worktree/branch作成なし。

## 2. 実稼働と競合防止

|担当|実施／成果|作成権限|
|---|---|---|
|himmel|安全確認、保全、全回帰、Jira更新、報告統合|REPORT/CHANGED_FILES/JIRA_UPDATE、共通evidence|
|stark|KAN-7、5幅×8領域の実Chromium監査、40画像、追加overflow切分け|UI_AUDIT、evidence/uiのみ|
|frieren|KAN-11、現行DB再抽出537件、14武器不足根拠と状態|TECHNIQUE_AUDIT、evidence/techniqueのみ|
|sein|KAN-8、4種類の実視覚/hash確認、正解座標不足と撮影条件|OCR_GROUND_TRUTH、evidence/ocrのみ|
|heiter|KAN-12、MHDB・テンプレ・実効容量再照合、映像チェックリスト|SALADA_AUDITのみ|
|fern|Stage4基準・全ログ・各監査根拠・保全の独立QA|QA、evidence/qaのみ|
|eisen|重要所見の独立レビュー、UI視覚／DB集計／保全|REVIEW、evidence/reviewのみ|

専門6名へ実際に委任して結果を回収。全員同時ではなく主を含む最大4枠で交代。共有FSのため専有報告と証跡を分離、製品/既存テスト全員編集禁止。UI撮影終了後に既存Browserを実行して並列ブラウザ影響を避けた。TOML自動適用や新規独立worktreeを稼働根拠として主張しない。

## 3. UI監査（KAN-7）

[UI_AUDIT.md](UI_AUDIT.md)。375/390/768/1024/1440px、8領域（装備・スキル・技・コンボ・DPS・保存比較・OCR・テンプレ）を実Chromiumで操作・撮影。40操作例外0/pageerror0、40画像+5contact。実Technique DBと合成小規模装備を使用し、実MHDB全装備・全武器・実画像OCR・テンプレ実DB反映・ネイティブiOSを代替したとは扱わない。OCR/テンプレは限定監査。

|候補|優先案|根拠と制約|
|---|---|---|
|参照資料の長いIDでページ横はみ出し|P2|375で+34px、390で+19px。#techAuditPanel内MACARONGAMEMO_DUAL_BLADES_VER1020の文字Range右端408.6875px。資料を閉じると解消。768以上0。初期折畳状態では解消し、比較表の局所scrollとは別|
|比較保留理由の低コントラスト|P2|スクリーンショット上の暗青背景／暗褐色文字。定量コントラスト比は未測定|
|装備／スキルの狭い列組み|P2|375/390と768の狭いasideで途中改行・縦長化。操作不能は再現せず|

限定シナリオでP0/P1再現なし。製品全体の不存在保証ではない。次実装案は長IDの折返し、理由文字色、領域幅に応じた列組み。修正は未実施。

## 4. Technique DBと正式DPS（KAN-11）

[TECHNIQUE_AUDIT.md](TECHNIQUE_AUDIT.md)。現行DBをメモリ内読取で再抽出：14武器537レコード。DBに記録されたverificationStatusはVERIFIED28、PARTIALLY_VERIFIED321、UNVERIFIED188。今回独立実機検証で28件を新たに認証したという意味ではない。MV/Hit/属性/特殊成分/版/revision/evidenceを記録し、PROVISIONALLY_ADOPTED等の数値採用状態を検証状態と分離。

正式絶対DPS成立確認0/14を更新する実機証拠は今回取得していない。旧時間／登録時間は参考、Stage4の未検証DPS null gateを維持。CB放出Ⅰ/Ⅱは暫定MV採用でもビン回数null。SAEDの採用配列存在は正式verifiedを意味しない。特殊成分・Handler接続・IG出典競合・対象版と全ルート時間等の不足を武器別整理。旧evidence参照23種類の抽出registry未解決は資料不存在と断定しない。

次案は対象版・条件・全Hit/特殊成分・回数・時間・実ダメージの証拠契約。数値を補完せず正式producerより先に必要根拠を揃える。相対STANDARD/基準100と非正規化火力・コンボ絶対DPSを混同しない。

## 5. OCR正解座標（KAN-8）

[OCR_GROUND_TRUTH.md](OCR_GROUND_TRUTH.md)。4種類の既存実画像を視覚/hash再確認。フルスクリーン／上下黒帯／枠撮影の実画像goldenは0/3。未知viewport・10境界・7名前bbox・物理cropはnull。旧overlay・中央16:9算出値・4K過去ROI・提案比率を正解データへ転用しない。

sample_gameは枠付き9行候補、phone画像は部分拡大/注釈で全viewport不可、simulationは旧検出overlay不採用、deco画像は装備9行ではない。Stage3実OCR auto0/7ずつの2画像を今回の認識率再測定として数えない。合成3系統のcrop不変条件はhimmel全Browser回帰で成功したが、viewport/9行検出器を呼ばず実機精度の証拠にはならない。

必要条件：同ゲーム版・言語・UI倍率・装備構成で9行全体の未加工実機原PNG、黒帯を含む原画像、screen四隅と9行を含む枠写真。二者の独立原画素注釈→許容誤差根拠→座標契約→detector比較→crop→Tesseract/MHDBの順。撮影仕様と測定手順を報告に具体化。

## 6. SALADA整合（KAN-12）

[SALADA_AUDIT.md](SALADA_AUDIT.md)。腕護火竜アームβ/id68/raw[2,1,1]は常時実効[3,2,1]となる既存関数をVMで再確認。テンプレ珠に適合し、数値・珠配置修正不要。ゲーム内実測とは別。API/importer versionをゲーム版へ読み替えない。

腰体術珠、脚挑戦珠3/重撃珠2は10/2過去ユーザー確認/R10として維持。映像verifiedではない。元動画の時刻、部位選択詳細、所有珠、限界突破と対象ゲーム版は未確認。確認すべき画面・連続タイムコード・撮影条件をチェックリスト化。KAN-12登録P2とStage3根拠収集優先案を分離し、未承認の優先度変更は行わない。

## 7. 回帰基準・QA・独立レビュー

|系統|Stage4成功|Stage5再実行成功|失敗|skip|
|---|---:|---:|---:|---:|
|Node|752|752|0|0|
|DOM|304|304|0|0|
|Browser|50|50|0|0|
|保存比較/14武器/旧護石smoke|16|16|0|0|
|旧OCR（11ファイル）|前段階11|11|0|0|
|Template Gates|前段階6|6|0|0|

Node24.19.0/jsdom30.1.2/Playwright1.62.1。すべて終了0。browser-baseline.logは50+smoke16=66、legacy-template-baseline.logは旧OCR11+Template6=17。smoke親を含む。UI40操作や独立監査をこのテスト件数へ加算しない。既存テスト削除・skip・期待値変更0。新規製品テスト追加0。evidence/test-results.jsonを参照。

[QA.md](QA.md)、[REVIEW.md](REVIEW.md)。fern/eisenは既存852ファイルの独立hash照合、ログ・監査根拠・未検証制約を確認。eisenはUI2画像の独立視覚とDB件数を再集計。重大な過大表現・阻害指摘なし、監査資料統合可。製品全体・実機品質・正式DPSの合格とは扱わない。

## 8. Jiraと次の判断

既存KAN-7/8/11/12/14へ実着手と監査結果コメントを記録し、開始時は進行中へ更新。KAN-7/11は監査結果レビュー待ち、KAN-8/12は根拠不足を含み継続、KAN-14は視覚回帰ゲート設計が残る。KAN-10はレビュー中を維持し正式完了へは動かさない。実結果は[JIRA_UPDATE.md](JIRA_UPDATE.md)。新規起票なし。認証情報は保存/表示しない。

ゼーリエ／ユーザーへ提示する次工程候補：

1. UI P2の3候補から最小実装範囲を選定。証拠が具体的な長ID折返しを第一候補とし、文字色は定量測定、列組みは長名/大量/実MHDBデータも検査する。
2. OCR3系統の原画像と独立注釈の取得。正解座標が揃うまで係数校正・検出器の公開接続を先行しない。
3. DPS武器別不足根拠の取得と正式証拠契約。DBのVERIFIED文字列だけで正式DPSを成立させない。
4. SALADA該当動画時刻と珠所有部位／版の映像照合。確認できない項目だけ追加撮影で補う。
5. 画面幅別の視覚回帰ゲートは監査データを起点に設計案を評価。合成短名snapshotを全機能保証へ拡張しない。

今回は監査と報告のみ。修正開始・公開・コミットを提案の承認と混同しない。
