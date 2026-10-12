# KAN-17 P0第2段階：SAED UI接続

2026-10-11。作業場所 /Users/scream/Projects/DEV_MWWSKILLSIM-r250、codex/integrate-r249、HEAD fb6d82cd525da9273af10ac6b719f330208608c5。原本リポジトリ変更・commit・push・merge・公開・Jira操作なし。既存未コミット成果を保持。開始時index.htmlは/private/tmp/kan17-cb-before.htmlに保全。

## 調査結果と修正

KAN-21のSAED専用Handlerは既に計算可能。Technique DBには通常派生・高出力派生の本体、暫定強属性ビン係数、5命中、盾補正があり、新しい数値調査は不要。技一覧・コンボアダプター・状態入力が未接続だった。

canonical:CB_SAED、canonical:CB_SAED_AED_DERIVEDを技選択へ追加。通常派生SAED1回の参考テンプレ adopted:cb_saedを追加。従来のCB STANDARD複合ルート全体を完成扱いにはしていない。自由コンボでは順序・反復を既存evaluateComboRouteで処理し、単発／テンプレ／自由の3経路が共通のcomboTechniqueDamage→chargeBladeComboDamage→chargeBladeSaedDamageを使用。

現在の装備集計・超会心・会心条件・対象肉質・斬れ味を既存Handlerへ渡す。盾補正と全5ビン命中はHandler側のみで適用し、UI側に式・係数を複製しない。数値は暫定・参考、実機VERIFIEDへ昇格しない。

ビン種（武器詳細に合わせた明示選択）と通常／強化ビンを追加。武器種から強属性ビンを推測しない。盾・斧状態を含め未選択は保留。榴弾係数未採用、属性欠損、会心撃【属性】の本体接続未完了は理由付き未算出。ビン強化の中間段階が追加で必要な場合、今回の通常／強化二状態とは区別し未採用とする。

## JSONと影響範囲

既存combo.chargeBladeStateへphialType、enhancedPhialを追加。既存キーとversionを維持。古い保存データの欠損状態は空欄へ復元し推測補完しない。preserveComboによる比較時の現条件保全を維持。
Technique DB領域を開始時コピーと比較し完全一致。KAN-13/19/21の数値・式を変更しない。DPS・時間の設計変更なし。

## 変更ファイル

- index.html：SAED技一覧・参考テンプレ・既存Handler接続、ビン状態UIと保存復元。
- tools/kan17-cb-saed-dom.test.cjs：追加5件。
- tools/kan17-cb-saed-browser.test.cjs：追加2件（375/1440px）。
- tools/canonical-presets-dom.test.cjs：旧CB未接続前提から対象を除外し、SAEDテンプレのDB由来・正確なID列を追加1件で検証。
- docs/reports/kan-17-cb/：報告、ログ、差分、画面画像。

## テスト

|対象|合格|失敗|skip|
|---|---:|---:|---:|
|Node|830|0|0|
|DOM|328|0|0|
|Browser・保存・テンプレ・旧OCR|115|0|0|
|新SAED Browser|2|0|0|
|合計|1275|0|0|

新DOMは3経路の一致・反復・5ビン・派生強化・未算出境界・Handler直接結果との一致・攻撃会心肉質変更・JSON復元を検証。初回REDは状態UI未存在で失敗、実装後GREEN。既存Nodeの文字列検査に合わせ既存の他技ビンゲートも保持。旧DOMの「CB参考テンプレ0件」という前提は今回の承認された接続に限って更新。削除・skip・無条件期待値緩和なし。git diff --check合格。

Browser115件はSAED接続直後、Node/DOMと新Browser2件は最終版を検証。Chromiumでの状態UIに横はみ出し・pageerrorなし。375px画像を目視確認。Safari実機および独立レビューは未実施。

## 残課題と次工程

- チャアク：強属性SAED2派生は接続済み。榴弾・解放ⅠⅡ・高出力等の未接続成分は引き続き保留。全CB技完成ではない。
- 弓・HBG：次工程で既存専用Handler再利用を優先。
- 操虫棍・LBG・狩猟笛・ガンランス：数値源と接続単位の確認後に部分実装。今回変更なし。

ゼーリエへのレビュー依頼：SAEDに限定したP0接続を採用候補として提示。新規数値・式なし、1275件合格、JSON既存互換維持。通常派生1回テンプレ・単発・自由コンボが利用可能。榴弾等の保留を維持し、次は弓・HBGの既存Handler接続へ進む範囲判断を依頼する。Jira更新はゼーリエ担当。
