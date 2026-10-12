# KAN-21 SAED最小接続

作業場所: /Users/scream/Projects/DEV_MWWSKILLSIM-r250。ブランチ codex/integrate-r249、HEAD fb6d82cd525da9273af10ac6b719f330208608c5。Jira #10057/#10058は読み取りのみ。commit・push・merge・公開・Jira更新なし。

## 実装と根拠

CB_SAEDを通常派生として維持し、CB_SAED_AED_DERIVEDを追加。Technique DBのphialReferenceをSAED数値源とし、chargeBladeResolveTechniqueDamageから専用chargeBladeSaedDamageへ接続。全5ビン・全命中。砲弾装填によるストック増加なし。POWER_ELEMENTのみ暫定採用し、通常8.2/強化11、高出力派生10/14を使用する。強化状態は明示入力必須。属性欠損や未指定状態は保留。

出典: https://kuroyonhon.com/mhwilds/memo/12.php （2026-10-11確認）。通常係数はver1.011までの旧値8/10と区別。派生係数はver1.02から。モーション一覧の通常/高出力派生および強化ビン各行は本体MV16・78・45、属性補正各1で一致する。既存r236の暫定MVとも一致を確認し、起動時ガード付きで共用する。

盾強化時の物理本体1.1、強属性ビン1.3は別補正。共有ビン式を盾補正なしで評価し、DBの1.3を一度だけ掛ける。SAEDに斧強化追撃は追加しない。現行基準1.042.00.02の実機VERIFIEDとはしない。既存EVIDENCE_GATED/UNVERIFIEDを維持し、戻り値はREFERENCE_ONLY、dps:null。

## 変更ファイル

- index.html: 出典登録、派生別DB、専用Resolverと既存Resolverへの分岐。
- tests/kan21-saed.test.cjs: 新規8件。4係数、全5Hit、盾補正、未知属性、強化未指定、榴弾保留、在庫上書き防止、派生本体を検証。
- tests/r221-technique-triage.test.cjs、tests/r222-technique-source-evidence.test.cjs、tests/r51-dual-blades.test.cjs: 承認済み派生IDの1件追加を検証。新ID以外の旧保留497件・全537件を維持する厳密検査を追加。旧監査JSONは変更なし。
- docs/reports/kan-21/: 報告、今回のみの差分、テスト証跡。

## テストと保全

実装前は新規7件の失敗を確認。追加1件を含め8件合格。初回全Nodeは826件中823合格・3失敗で、原因は旧総数固定。新IDがちょうど1件増え旧件数を維持する検査へ根拠付き更新後、以下すべて合格。

|対象|実行・合格|失敗|skip|
|---|---:|---:|---:|
|Node|826|0|0|
|DOM|313|0|0|
|Browser・旧OCR・テンプレ・追加統合検証|110|0|0|
|合計|1249|0|0|

既存1241件＋新規8件。BrowserはChromium直列実行。製品コードはDOM/Browser実行後に変更していない。git diff --check成功。開始時index.htmlと旧テスト3ファイルを/private/tmp/kan21-before-*へコピー。KAN-19のARTIA_ELEMENT_SOURCE_DB、KAN-13のdpsForStats/compareSnapshotは開始時と文字列一致。差分とRED/初回失敗/最終ログはevidence/。

## 残課題とレビュー依頼

今回の接続は専用Handler APIの参考計算。既存STANDARDルートやコンボUI・保存比較にSAED選択を追加する変更ではない。正式DPSは未算出を維持。榴弾SAED係数は採用対象外として保留。強化ビン混在モデル、派生状態遷移、現行版実機VERIFIEDも対象外。部分命中UI・追加撮影なし。独立レビュー・Safari実機確認は未実施。

ゼーリエに、暫定状態・本体共用根拠・5発標準・盾補正・差分とテスト証跡のレビューを依頼する。
