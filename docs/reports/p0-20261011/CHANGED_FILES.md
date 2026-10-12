# 今回変更ファイル

既存変更を含むgit diff全体ではなく、今回の開始時SHA-256との比較。

|ファイル|変更理由|
|---|---|
|index.html|砲撃参考3アクション、明示条件UI・JSON保存復元・逐次弾数計画・共通Handler接続。Technique DBに暫定ルール／根拠を追加。弓/HBG P0の適正距離固定。ダメージ限定技の時間適合を分離|
|gunlance-shell-reference.js（新規）|既存genericProfileDamageを使う砲撃専用の薄いアダプター。数値はDB参照|
|tests/kan23-shell-reference.test.cjs（新規）|物理／火属性分離、失敗閉鎖、根拠参照、放射／拡散・装填上限の6件|
|tools/kan23-shell-p0-dom.test.cjs（新規）|3経路、逐次消費、JSON、火肉質、時間対象外、入力更新、混在の9件|
|tools/kan17-fourteen-p0-dom.test.cjs（新規）|14武器の限定単発／参考／自由の一致と欠損成分保留の14件|
|tools/kan23-shell-p0-browser.test.cjs（新規）|5画面幅で3操作・保存復元・未算出・表示の5件|
|tools/kan17-ranged-p0-dom.test.cjs|P0適正距離仕様に合わせた数値一致／旧距離選択不変。弓・HBG共通条件の1件を追加|
|tools/canonical-timing-dom.test.cjs|既存29技の時間適合を共通関数で判定し、新規ダメージ限定技を混入させない|
|docs/reports/kan-23/FOCUS_WYRMSTAKE_EVIDENCE.md|旧24Hit累積記録を保持し、後続資料による成分分類保留を明記|
|docs/reports/p0-20261011/ 以下（新規）|報告、レビュー、テストログ、5画像、開始時比較差分・保全・実コード14武器監査|

製品変更はindex.htmlと新規Handlerの2ファイル。既存計算値・既存Hit・KAN-13/19/21の製品モジュールは変更なし。旧画像の再生成分は開始時内容を復元。削除ファイルなし。
