# KAN-17 P0第4段階：ガンランス打撃ルート

2026-10-11。/Users/scream/Projects/DEV_MWWSKILLSIM-r250、codex/integrate-r249、HEAD fb6d82cd525da9273af10ac6b719f330208608c5。既存未コミット成果を保持。開始時index.htmlは/private/tmp/kan17-gl-before.htmlに保全。原本変更・commit・push・merge・公開・Jira編集なし。

## 4武器の既存データ確認

|武器|既存データとHandler|今回の判断|
|---|---|---|
|ガンランス|50レコード。GL_SLAM/GL_SWEEPは物理・属性のBODY技で共通エンジン接続済み。GunlanceHandlerの砲撃・竜杭はEVIDENCE_GATED|打撃2技だけの明示的な参考テンプレを追加|
|狩猟笛|61レコード。左右振り等の通常技データあり。音波・響周波のsource estimateあり。完全STANDARDのイベント対応・回数等は未接続|今回未変更。通常技を限定した次候補|
|操虫棍|43レコード。GenericWeaponHandlerあり。三色状態・消費遷移等が必要。旧移動斬りは属性補正SOURCE_CONFLICT|技・状態単位での採用範囲整理が必要。今回未変更|
|LBG|31レコード。通常弾のMV/Hit数の資料値は登録済み。武器適用・弾式・速射がEVIDENCE_GATED|HBG専用の式を無条件流用しない。今回未変更|

数は現在のTechnique DBから取得。数値不足とHandler未接続を混同しない。新規外部情報収集なし。

## 接続と表示範囲

adopted:gl_meleeを追加：叩きつけ→なぎ払い（砲撃・竜杭なし／参考）。既存の単発・自由コンボに加え参考テンプレが利用可能。既存comboTechniqueDamage→ordinaryComboTechniqueDamage→genericProfileDamageを再利用。新しい式・数値なし。
GL_SLAM（MV57・属性補正1）とGL_SWEEP（MV40・属性補正1.5）はDBの登録値を使用。現行DBではPARTIALLY_VERIFIED、資料MACARONGAMEMO_GUNLANCE_MOTION_CURRENT、対象1.042.00.02。実機VERIFIEDへ昇格しない。
これは2つの独立した打撃技を並べたコンボの完全な合計であり、砲撃・竜杭を含むSTANDARDの部分合計を総ダメージにしたものではない。フルバーストを加えた未接続ルートは全体未算出。GunlanceHandlerの特殊成分を完成扱いにしない。

## 保存・復元の退行修正

新回帰で、P0の自由コンボを一度計算した後のJSON読込でコンボが消える不具合を再現。applyBuildSnapshot内のcalcBuildによるP0自動更新が、復元途中のDOMをsyncFromDOMして読み込んだApp.state.comboを上書きしていた。
読み込み中のみP0自動更新を停止し、finallyで元の停止状態を戻して復元後に更新。武器・防具IDの事前検証は停止処理より前に保持。JSONキー／versionは変更しない。preserveComboの動作を維持。テスト期待値を変更せず問題を修正。

## 変更ファイル

- index.html：打撃テンプレ追加、復元中のP0自動更新停止。
- tools/kan17-gunlance-p0-dom.test.cjs：追加4件（3経路一致・現条件更新・特殊成分保留・JSON復元）。
- tools/kan17-gunlance-p0-browser.test.cjs：追加2件（375/1440px、3操作・JSON復元）。
- tools/canonical-presets-dom.test.cjs：GL未接続前提を限定更新し、正確な2技IDと砲撃なし名称を追加1件で検証。
- docs/reports/kan-17-gl/：報告・ログ・差分・画像。

Technique DB領域は開始時と完全一致。KAN-13/19/21、弓・HBG・SAED、他武器の数値・式は変更しない。DPS・時間データ変更なし。

## 回帰検証

|対象|合格|失敗|skip|
|---|---:|---:|---:|
|Node|830|0|0|
|DOM|341|0|0|
|Browser・保存・テンプレ・旧OCR|123|0|0|
|合計|1294|0|0|

REDで不足テンプレとP0計算後の保存復元失敗を確認。GREEN4件。全DOM・Node最終版を再実行。Browser123件は最終の事前検証順序修正前に合格し、最終版のGL Browser2件も再実行して合格（合計には重複加算しない）。初回Node4件の失敗はUI変数を事前検証より前に参照したためで、製品の順序を修正して既存期待値のまま合格。削除・skip・期待値緩和なし。git diff --check合格。
Chromium375/1440pxで横はみ出し・pageerrorなし。375px画像を目視確認。Safari実機と独立担当レビューは未実施。

## 残課題・ゼーリエへの依頼

限定打撃ルートの3経路接続と保存復元修正をレビュー依頼。砲撃・竜杭全成分は未算出を維持。CBのSAED以外（解放ⅠⅡ・高出力等）の未接続成分も残課題。操虫棍・LBG・狩猟笛は今回未変更。

Jira転記用：ガンランスの叩きつけ→なぎ払い（砲撃・竜杭なし）参考テンプレを追加し3経路を利用可能にした。P0計算後のJSON復元でコンボが消える退行も最小修正。既存DB・式・JSON互換を保持。1294件合格、失敗skip0。特殊成分を含む未接続ルートは全体未算出。公開・Git更新なし。
