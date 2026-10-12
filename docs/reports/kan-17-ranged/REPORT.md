# KAN-17 P0第3段階：弓・HBG限定接続

2026-10-11。r250 worktree /Users/scream/Projects/DEV_MWWSKILLSIM-r250、codex/integrate-r249、HEAD fb6d82cd525da9273af10ac6b719f330208608c5。開始時index.html・bow-reference.jsは/private/tmp/kan17-ranged-before-*へ保全。元リポジトリ変更、commit・push・merge・rebase・公開・Jira編集なし。

## 原因と実装範囲

弓は既存BowReference.standardが固定3射の保存比較に接続済みで、溜め3の射撃・剛射・剛連射、ビン・距離、通常矢／剛射強化、チャージマスター、会心撃【属性】等の計算を持つ。HBGはBowgunNormalReference.shotが通常弾Lv1〜3の3接触参考シナリオを持つ。P0技選択と共通操作へのアダプターが不足していた。新しい数値調査なし。

- 弓：3技の単発、射撃→剛射→剛連射の参考テンプレ、並べ替え・反復を含む自由コンボを追加。
- HBG：通常弾Lv1〜3の単発、Lv3・1発の参考テンプレ、自由コンボを追加。弾Lvは選択したTechnique IDに従う。
- P0の共通evaluateComboRoute／comboTechniqueDamageからRangedReferenceHandlerへ委譲。参考結果を事前評価し、各段の本体・属性・traceを既存合計へ引き継ぐ。
- bow-reference.jsの計算本体を共有し、既存standardの3技制約を維持したままtechnique APIを追加。数式の複製なし。射順依存フォースショットは固定3射でのみ算出し、単発・任意順で射順をリセットして計算しない。
- HBGは既存shotを各段で呼び、ファースト／フォースショット使用時は入力された射順を1段ずつ進める。装填数超過と弾Lv混在時の射順不明は保留。

## 条件・保留・互換性

攻撃・会心は既存P0ビルド集計、超会心は装備スキル、肉質は現在の部位から取得。ビン・距離・HBG通常モード・装填数・射順は既存保存比較の条件UIを使用。装備・条件変更で再計算し、斬れ味は射撃に適用しない。
弓の刃鱗増装は通常状態（未発動）で評価。発動後の任意射順評価や稼働率を新設しない。固定3射のフォースショットには既存の射順入力が必要。
貫通ビン、弓の他溜め段階、HBGの散弾・貫通弾・属性弾等は対象外。未対応技・条件欠損・モジュール欠損は理由付き未算出。
通常弾は武器属性を使わないため、HBGの武器属性欠損でも通常弾だけは算出可能。計算ローカル入力で武器属性を非適用として扱い、装備DB・保存JSONの未知属性を0へ書き換えない。弓の属性欠損は引き続き未算出。

既存Technique DB領域は開始時と完全一致。KAN-13/19/21の数値・式・既存JSONキー／versionを維持。BowReference APIは追加でありstandardの呼び方は維持。既存traceへtechniqueIdを追加し段ごとの成分を追跡可能にした。DPS・時間調査／計算モデル変更なし。保存比較の全弾種対応を完成扱いにはしない。

## 変更ファイル

1. index.html：弓・通常弾HBGの技／テンプレ、共通P0アダプター、条件伝播。
2. bow-reference.js：共有評価本体＋単発API、固定射順ガード、traceの技ID。
3. tools/kan17-ranged-p0-dom.test.cjs：追加7件。
4. tools/kan17-ranged-p0-browser.test.cjs：追加4件。
5. tools/canonical-presets-dom.test.cjs：旧未接続対象から弓/HBGを除外し、正確なテンプレID列・Handlerを追加1件で検証。
6. tools/expanded-combo-dom.test.cjs：普通技と専用Handlerを区別し、専用技もDB由来・時間未確定・対象武器を検証。
7. docs/reports/kan-17-ranged/：報告・差分・ログ・画面画像。

既存テストの変更は承認された接続による前提変更のみ。削除・skip・安易な期待値変更なし。

## テスト結果

|対象|実行／合格|失敗|skip|
|---|---:|---:|---:|
|Node|830|0|0|
|DOM|336|0|0|
|既存Browser＋保存・テンプレ・旧OCR|117|0|0|
|追加Ranged Browser|4|0|0|
|合計|1287|0|0|

回帰：弓テンプレと保存比較Handlerの数値一致、HBG全Lvと同Handlerの一致、単発・反復・自由コンボ、攻撃／会心／肉質変更、斬れ味非適用、武器属性未適用、欠損・貫通・距離未選択の保留、射順依存スキル・リロード跨ぎ保留。
REDは技未接続の失敗を確認。GREENは追加DOM7件。実Chromiumの375/1440pxで各3操作、再計算、横はみ出し・pageerrorなしを確認。bow-375.pngを目視確認。Safari実機確認・独立した担当レビューは未実施。git diff --check合格。

## 残課題とレビュー依頼

弓・HBGの全技完成ではなく、既存根拠のある上記範囲を採用候補として提示。任意コンボの射順スキル未対応条件は保留を維持。次候補は操虫棍・LBG・狩猟笛・ガンランスの既存データで算出可能な部分。数値不足成分は推測補完しない。

Jira転記用：KAN-17 P0第3段階、弓溜め3の3技とHBG通常弾Lv1〜3を単発／参考テンプレ／自由コンボへ接続。既存専用式・Technique DB共用、1287件合格、失敗skip0、JSON互換とKAN-13/19/21を保全。未対応弾種・射順条件は理由付き保留。ゼーリエへ限定接続のレビューを依頼。
