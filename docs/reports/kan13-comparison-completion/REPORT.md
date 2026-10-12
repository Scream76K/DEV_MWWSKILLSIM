# KAN-13 保存比較のダメージ専用接続（2026-10-12）

Base origin/develop 657bda43de7c4a55bf30d0f2bdb790c0f72f17c9、branch codex/kan13-damage-comparison。隔離場所 /Users/scream/.codex/worktrees/r250-develop-migration/DEV_MWWSKILLSIM。

原因：単発/参考/自由P0はShell/Rangedの状態と専用Handler準備を実施するが、既存保存比較のコンボDPS経路はこの準備を渡さない。ダメージを得るためにDPS/時間の成立を要求しない経路が比較に必要だった。
修正：既存P0の数値処理をevaluateP0DamageRouteへそのまま抽出し、保存比較から共用。referenceComboに合計/Hit内訳/状態/複数保留理由を追加。referenceComboChangeは同武器/同順序技列/正の基準ダメージだけで基準100と増減%を返す。指定コンボ合計/相対/保留理由を別行表示。未知/未対応を混ぜると全体未算出、部分合計を総ダメージとしない。
既存powerIndex/maxPowerIndex/relativePowerIndex、物理/属性/会心/最大会心、正式DPSのJSONキーと意味を維持。指定コンボ相対値をSTANDARD火力指数へ代入しない。比較は従来どおり現在の共通指定コンボを各保存ビルドへ適用し、各保存コンボを個別に違う技列として比較する仕様へ変更しない。referenceCombo.contextにP0の対象/状態条件を記録し、STANDARDの共通条件と混同しない。

変更ファイル：index.html（製品）、tests/r250-dps-verification-gate.test.cjs（単独VMの依存登録）、tools/canonical-route-browser.test.cjs（最後の行への依存をDPS行の意味指定へ変更）、新tools/kan13-p0-comparison-dom.test.cjs（12件）、新tools/kan13-p0-comparison-browser.test.cjs（2件）。旧テストの数値期待値緩和/削除/skipなし。

|Suite|Pass|Fail|Skip|
|---|---:|---:|---:|
|Node|878|0|0|
|DOM|477|0|0|
|Browser/integration/OCR/template|136|0|0|
|Total|1491|0|0|

Base1477＋新14。初回追加再現3件失敗から修正後成功。全回帰初回のVM依存35件/旧UI位置2件はテスト初期化/行指定前提を修正し、補助評価がSTANDARDを止めない例外隔離を追加して最終合格。最初のBrowser実行で旧step125b_v311のファイル指定を誤ったため、その実行を最終全対象結果とせず正しい一覧で再実行。ログevidence/。
GL合計/残弾/復元、Ranged3武器、未知攻撃/会心/肉質、複数保留、比較JSONコピー分離、STANDARD成分/会心/最大/基準100を検証。375/1440の新表示と既存レイアウト回帰で横はみ出しなし。
アイゼン最終レビューは必須修正なし、新DOM12独立合格。REVIEW.md参照。

539 Technique DBレコードは変更前後JSON完全一致。HBG竜撃弾は未接続維持。本修正は既存接続済み技の共通P0を比較へ通すもので、全特殊技完成を意味しない。CB非SAED/猟虫/音波/砲撃等の未対応条件は既存理由付き保留を維持。DPS/時間開発なし。
Safari/CIはFOLLOW_UP_TASKS.mdに別タスク化。元r250ファイル変更なし、main/develop/公開/Jiraステータス変更なし。新フェーズのcommit/pushは実施していない。
