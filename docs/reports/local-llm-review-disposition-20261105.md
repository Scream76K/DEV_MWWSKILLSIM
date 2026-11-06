# ローカルLLM提案の照合結果

対象: `../local-llm-review/static-20261105T000420Z/proposals.md`、qwen2.5-coder:7b。44項目（44は途中終了）。APIのdone=trueは生成終了を示すだけで、done_reason=length、eval_count=5000。レビュー完遂・受入成功の根拠にはしない。入力20381トークン、抜粋資料による限定点検。再起動・追加LLM問い合わせなし。

照合開始時、固定snapshotの全14ファイルが現行と同一hashだった。以下の番号は原提案に対応する。

|番号|判断|照合根拠|
|---|---|---|
|1|不採用|GL報告・SA/IG報告に公式版不明null、暫定条件、出典、実測未確認を明記済み。「最新ゲーム版V10.42.00.02」を割当てる提案には根拠がなく採用不可。|
|2|追加変更不要|evaluateConsumerCombat→実計算adapterとconsumerDamageMetricのチャンネル別comboTotalDamage参照。GL報告と独立条件欠落テストに契約あり。通常/最大の別結果を維持。|
|3、6|不採用|baselineGameVersion=nullは保存保護の判定ではない。runCompareはcurrent/conditionsを保存、finallyで復元、buildSnapshotMatches・条件JSON・calculationFingerprintで復元確認。|
|4|不採用|oneHitPipelineのicons/layoutという説明は存在しない構造を想定。アイコン資産・CSS・DOMは別実装。既存Chromiumの14武器アイコン、9属性PNG、6カテゴリSVG、5幅証拠を参照。|
|5、8|追加変更不要|casesは回帰テストの代表入力一覧。製品の対象制限機構ではない。GL報告に代表ケースであり全条件受入ではないと明記済み。|
|9|不採用|snapshotはmanifest対象ファイルの固定コピー。cases配列から製品snapshotを決定するという主張は誤り。|
|10|追加変更不要|local-mhdb-cache.jsのcommitUpdate等と専用報告にactive/previous原子的保存、失敗時保持、ビルド領域分離を記録済み。casesはIndexedDB動作制限ではない。|
|11|不採用|製品実行コードがgit commit/pushするとの根拠なし。作業上もcommit/push/merge/公開は禁止・未実施。|
|12|追加変更不要|consumerEvaluationPlanは明示技列の正規化または採用基準選択。各固有入力の検証はadapter/producerにも分担。cases配列へ製品検証を限定する提案は誤り。|
|13、18|不採用|consumerDamageMetricは計算本体ではなく完了済みcomboTotalDamageの読み出しと保留理由の選択。計算はadapter側。|
|14、15|追加変更不要|consumerRelativeReasonは武器種・対象・技列の不一致とA通常の成立を確認。consumerChangeRowsは相対値/差分だけを保留。前回GL異技列公開比較で確認済み。|
|16、19|追加変更不要|consumerCoverageSummaryは通常/最大の独立成立数と原因集計。テストcasesに依存しない。|
|17、20〜44|不採用|consumerFooterという関数は存在せず、後半は同一提案の反復。実際の比較フッターは比較描画内で現行結果から生成。報告出力は別のイベント/JSON処理。具体的な欠陥根拠なし。|
|7|計算提案は不採用、関連文言1箇所修正|DPS/oneHit計算を説明・追加する提案は廃止仕様に反する。一方独立照合で異武器種選択時の公開エラーに「検証済みコンボDPSが揃った場合のみ対応」が残っていたため、同じ武器種を選ぶ案内へ修正。LLM自身がこの具体的箇所を指摘したわけではない。|

## 実変更と検証

`index.html`のrunCompare異武器種ガードのメッセージ1箇所のみ変更。「異なる武器種の火力は直接比較できません。同じ武器種の保存ビルドを選択してください。」とした。ガード条件・計算・保存処理は変更なし。

固定snapshotとの機械比較で、この文字列置換以外のソース差分がないことを確認。UI表示・ワークフロー・保存状態所有権の既存33テスト成功、git diff --check成功。証拠は元LLM出力フォルダのhuman-review-tests.txt、human-review-validation.json。

最終index SHA256: `c4389b60955ce8de585290fa1b07f12cab59bceac28bc87ff6d18f27badc3a8c`。

14武器公開A/B、CB独立開始・丸め前単純加算、5幅Chromiumの既存証拠は直前hash `85da64dcc39fe86376c5b338bbd4cea53c4ea7bc29fecc50e931a8162867a4cf`。今回は文字列だけの変更のため14武器・ブラウザーの全再実行はしていない。新hashで実行済みと扱わない。Safari/iPhone/iPad実機・ゲーム内実測・API再取得は未実施。GL/SA/IGの暫定採用条件と未対応範囲は維持。

既存未コミット成果を保護。新規報告以外の変更は上記1文のみ。commit/push/PR統合なし。
