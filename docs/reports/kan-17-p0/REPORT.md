# KAN-17 P0 ダメージ3機能・初回接続

2026-10-11。Jira #10066の読み取りで指示を確認。Jira編集なし。
作業場所：/Users/scream/Projects/DEV_MWWSKILLSIM-r250
ブランチ：codex/integrate-r249
HEAD：fb6d82cd525da9273af10ac6b719f330208608c5
commit・push・merge・rebase・公開なし。既存KAN-13/19/21の未コミット成果を保全。開始時index.htmlは/private/tmp/kan17-p0-before-index.htmlに保存。

## 調査と最小修正

保存比較STANDARDと任意コンボの計算経路は既存。任意コンボのダメージはDPSボタンに付随し、選択単発技・テンプレ合計の専用操作が不足していた。
3ボタンを追加し、同じcomboDamageContext → evaluateComboRoute → comboTechniqueDamageを利用。計算式を新設していない。時間が不明でもダメージを計算し、数値は「暫定・参考」と表示。現在の装備集計、会心率、装備の超会心、選択肉質を入力し、指定技の順序・反復を保持。既存エンジン未対応の特殊成分・条件を解決したとは扱わない。
DB未接続技が含まれる場合、部分合計を確定値として表示せず未算出理由を表示。装備・技・条件変更で要求済み結果を再計算し、武器種変更で破棄。
スラッシュアックスの既存DB4技とSTANDARDテンプレの選択経路を追加。片手剣の既存ID・テンプレを維持。Technique DB領域を開始時コピーと照合し一致を確認。P0ではDB数値・計算式・DPSモデル・時間データを変更していない。

## 武器別接続と残課題

|範囲|武器|状況|
|---|---|---|
|3経路のDBテンプレ接続|大剣・太刀・片手剣・双剣・ハンマー・ランス・スラッシュアックス|7武器。テンプレ／単発／指定コンボが利用可能|
|一部技のみ|狩猟笛・ガンランス・チャージアックス|本体技等は利用可能。STANDARD全成分の接続は未完了|
|この技選択UIは未接続|操虫棍・ライト・ヘビィ・弓|既存専用Handlerとの接続が必要。弓と通常弾HBGの保存比較接続とは別|

全14武器での完成とは報告しない。次は既存SAED Handlerの状態入力とUI接続、弓・通常弾HBGの既存専用経路再利用を優先候補とする。根拠のない数値は追加しない。

## 検証

|対象|実行／合格|失敗|skip|
|---|---:|---:|---:|
|Node|830|0|0|
|DOM|322|0|0|
|Browser|82|0|0|
|保存・テンプレ追加検証|22|0|0|
|旧OCRスクリプト|11|0|0|
|合計|1267|0|0|

追加回帰：DOM7件、Browser5件。単発と反復の関係、テンプレと同順序指定コンボの一致、攻撃・肉質変更、超会心伝播、未接続の保留、片手剣・SAテンプレ、375/390/768/1024/1440pxの操作・横はみ出しを検証。最終片手剣ID保全後もDOM全件とBrowser追加5件を再実行。ChromiumでありSafari実機検証ではない。独立レビューは未実施。
旧DOMのSA未接続前提2箇所を更新。canonical-presetsは4技IDを明示した7武器テンプレの一致検証へ拡張し、expanded-comboはSAにもDB由来・時間未確定・特殊未採用技を混入しない検査を適用。期待値の無条件緩和ではない。

## 変更ファイル

- index.html：共通ダメージ3操作・結果更新、SA選択経路。
- tools/kan17-p0-damage-dom.test.cjs：追加7件。
- tools/kan17-p0-damage-browser.test.cjs：追加5幅。
- tools/canonical-presets-dom.test.cjs：SA追加を正確なID列で検証。
- tools/expanded-combo-dom.test.cjs：SAのDB由来検証を適用。
- docs/reports/kan-17-p0/：報告・ログ・差分・画像。

証跡：evidence/*-final.log、implementation.diff、ui/damage-*.png。接続監査JSONは途中記録であり、weapon-ui-connections.jsonはSNSのfixtureキー誤りで不採用。connections-after.jsonのSNS6 IDは一時的な別名追加時の値で、最終版では既存4 IDへ戻した。上表を最終結論とする。DBキーは製品側で変更していない。

## ゼーリエへの判断依頼・Jira転記用

P0共通操作を実装し、既存の7武器テンプレを含む3経路を接続。1267件合格、失敗・skipなし。14武器のうち残りは一部3・未接続4。計算数値源と既存式を維持し、未接続は理由付き保留。次の専用Handler接続範囲の承認とSafari通常動作確認を依頼する。Jira更新はゼーリエ担当。
