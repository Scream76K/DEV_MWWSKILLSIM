# P1元武器数値の欠損伝播修正（2026-10-12）

## 結果

元武器DB→装備集計→P0単発/参考/自由→保存復元/比較に攻撃・会心の既知フラグを伝播。正常な会心0%は既知として計算可能。限定範囲の独立レビューを通過、最終1390件合格。

r250 / codex/integrate-r249 / HEAD fb6d82cd525da9273af10ac6b719f330208608c5。HEAD不変、origin/develop先行3コミット不変。原本/main/develop/GUILDを変更せず、commit/push/merge/rebase/公開/Jira操作なし。

## 原因と最小修正

calcBuildのw.attack??0、w.affinity??0で欠損が有限0となり、派生数値だけのガードを通っていた。Artia固定生成にもaffinity??0が存在。
既存計算式と数値キーを保持し、attackKnown/affinityKnownを集計statsへ追加。通常武器はraw/display/attackの既知値、Artiaは完成固定値の由来を使用。Artia固定生成と取得にも由来フラグを保持。
P0コンテキスト、共通evaluateComboRoute、damageForStats、dpsForStats、STANDARD比較入口でfalseを保留理由へ伝播。比較stats出力にもフラグを追加。新DPSモデル/時間実装ではなく既存出力の安全ガードのみ。
砲撃限定は会心を計算に使用しないため、全行が専用砲撃Handlerの場合だけ会心欠損を許可。元攻撃欠損や本体混在は保留。
保存JSONの既存キー/武器IDは変更せず、復元時に現DBと固定値から再集計する。古い保存に新フラグを必須化していない。未知をVERIFIEDへ昇格せず、数値源Technique DBに変更なし。

## 回帰

追加16件：14武器各々で元damage/attack削除、元affinity削除→実calcBuild→3経路とSTANDARD/保存比較保留、保存snapshot復元後欠損保留、正常0%/20%成立。Artia完成固定生成の欠損/正常0%、GL会心欠損砲撃3経路成立/本体混在保留も追加。
修正前の攻撃欠損、保存damage、砲撃例外の失敗ログを保存。初回回帰では旧合成武器fixtureに会心指定がなく失敗したため、35既存テストファイルへ正常0%を明示。Node抽出テスト2ファイルは新helperを実ソースから読み込む。期待値緩和・削除・skipなし。
途中の共通判定が未知技でthrowする問題も既存AIテストで検出し修正。最終実行は以下。

|スイート|実行/合格|失敗|skip|
|---|---:|---:|---:|
|Node|839|0|0|
|DOM|417|0|0|
|Browser・統合・旧OCR・Template|134|0|0|
|合計|1390|0|0|

基準1374から16増。全プロセス終了コード0。Chromium自動試験でありSafari実機の代用とはしない。独立レビュー詳細はREVIEW.md。

## 保全

開始時ファイル一覧/ハッシュは/private/tmp/p1-source-start/hashes.json。既存削除0。539レコードは全件完全一致（evidence/db-preservation.json）。KAN-13/19/21の成果保持。今回製品変更index.html、既存テスト37ファイル、追加テスト1。詳細CHANGED_FILES.mdとindex-stage.diff。

## GLと残る品質ゲート

P1元入力ガードは限定範囲で解消。GLは既知shellタイプと条件矛盾を保留、装填は逐次消費し不足保留、砲術/砲弾装填/未照合食事等は既存unsupportedガードを維持。実武器のshellLevelと砲撃力段階の対応、砲術等の数値根拠/対象版は未照合であり追加採用しない。前工程のAPI403・実武器未確認は解消したとは扱わない。
次工程はGL実武器適用とスキル補正の根拠照合、Mac Safari/iPhoneの保存復元/3経路/保留/UI実機チェック。Safari実機未実施、公開ゲート未達。前工程BETA_QUALITY_GATES.mdのチェックリストを維持。
集中竜杭は傷なし8/傷あり27Hit観測のみ、分割不明。全技完成を待たず限定範囲の品質判断は可能だが今回公開承認を求めるものではない。

ゼーリエレビュー依頼：元攻撃/会心欠損のP1を既知フラグ伝播で解消、正常0%会心とArtia固定値経路維持。1390件合格・失敗skip0、独立レビュー限定承認可能。539件不変、未コミット。GL実武器/砲術とSafari確認を次工程とする判断を依頼。
