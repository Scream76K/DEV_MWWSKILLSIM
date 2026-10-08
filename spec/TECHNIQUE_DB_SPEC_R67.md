# r67 旧コンボ技の数値をDB互換領域へ移行

本体開発の「Technique DB → 技IDによるコンボ → 特殊Handler → 比較」という責務分離を再開した。今回は14武器種・60技の初期参考値の保存場所を整理し、既存結果を維持する範囲に限定。

LEGACY_COMBO_TECHNIQUE_DBは旧IDごとの技名・MV・資料区分を不変に保持する。LEGACY_COMBO_TEMPLATESは技ID・所要時間・プリセットを持ち、MVを含めない。旧COMBO_DATAは互換用TechniqueオブジェクトとしてDBから生成する。既存保存ID、技の並び、プリセット、技追加・削除を維持する。

互換領域の全60技はLEGACY_REFERENCE_ONLY、UNVERIFIED、LEGACY_COMPATIBILITY_ONLY。r66の既存値を保存する根拠R66_LEGACY_COMBO_SEEDはゲーム検証の根拠ではない。初期値を公式データ、現行値、検証済み値に昇格させない。既存の互換計算のみが使用する。所要時間もLEGACY_REFERENCE_ONLY。

TechniqueDBEngine.legacyArchive.get(kind,id)とtemplates(kind)で参照できる。武器種・IDは完全一致し、別武器や不明IDはnull。欠けた組み込み参照は初期化時にエラー。凍結レコードから生成する互換オブジェクトの変更はDBへ戻らない。

Canonical技DB533件、厳密なhits()、STANDARDと専用Handlerのゲートは変更しない。互換IDをcanonicalのhits()へ渡しても計算を拒否する。ユーザー追加技は従来の端末内保存キーと形式を維持し、互換DB・canonical DBに登録しない。

92単体、6DOM統合、4Chromium、計102件成功。r66固定フィクスチャから全14武器の技名・MV・時間・資料区分・プリセットを照合。DB不変性、canonicalへの混入拒否、別武器参照拒否、カスタム技の保存・削除を確認。r66の固定列・最大幅・表折り返しも再検証。

今回で旧コンボの検証済みcanonical IDへの切り替えが完了したとは扱わない。次は名称・状態・Hit構成の明示的対応を確定し、基準版の確認が済んだ技から切り替える。旧合算MVをHit別値として推測展開しない。操虫棍・狩猟笛などの未確定条件は維持する。

再現：npm ci、npm test、npm run test:dom、ブラウザ準備後npm run test:browser。
