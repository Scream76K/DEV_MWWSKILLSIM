# KAN-13 第2段階

作業場所 /Users/scream/Projects/DEV_MWWSKILLSIM-r250。codex/integrate-r249、HEAD fb6d82cd525da9273af10ac6b719f330208608c5。45分を上限目安に限定作業。commit/push/merge/rebase/公開/Jira操作なし。

## 実施範囲と変更

計算式/数値エンジン/Technique DB/検証状態生成条件は変更なし。既存JSONフィールドpowerIndex/maxPowerIndex/relativePowerIndex/relativeMaximumPowerIndex/dpsは維持。schemaVersion2のまま追加フィールドcomboVerificationを付加。通常/最大の表示は「火力指数（計算値）［非正規化］」とし、既存の基準100行を維持する。

既存evaluateComboRouteの結果から状態、代表理由、全blocked理由、時間未確定技ID、技別ダメージ/Hit内訳/数値由来/既存検証状態/contextをコピーして、dpsForStats→compareSnapshot→既存JSONエクスポートへ伝播。再計算や検証済みへの昇格なし。JSON返却はキャッシュから独立したコピー。参考ダメージ詳細が存在してもDPSは未算出を維持。コンボなし/評価前の入力エラーで詳細が存在しない場合はcomboVerification:null。

## 原因分析と一致確認

変更前、STANDARD同一条件の一致は合格した一方、診断伝播/複数理由/表示名称/コピー分離の4件は失敗を確認。診断情報が中間関数で縮約されていたため、結果を引き継ぐ最小修正。

一致テストは実コードとオフライン装備fixtureを使用。大剣、攻撃Lv2/見切りLv1/超会心Lv2、実在する登録コンボgs_charge3を使用し、STANDARDとコンボを互いに比較しない。STANDARDは同じstats/装備スキル/共通条件の入力を用いて単体呼出しと保存比較の非正規化値を一致確認し、相対値100を確認。コンボは単体calcDpsと保存比較の参考ダメージ/Hit別物理・属性・合計、dpsStatus/nullを一致確認。

最初のコンボ試験で371.71対209.09の差が出たが、単体がmonsterHZのフォールバック、比較がStep5の値を使っていて肉質が不一致だった。同じ肉質を明示して一致。スキル追加後のSTANDARD試験でも超会心の入力元が不一致だったため、既存比較仕様と同じ装備Lvを単体入力へ明示して一致。期待値の緩和や計算式変更は行わない。

## 保全と変更ファイル

開始時1160ファイルのSHA256を比較、既存の変更はindex.htmlのみ、欠落0。KAN-19の報告/テスト/module補助はハッシュ一致。ARTIA_ELEMENT_SOURCE_DBは既存SOURCE_DB_AUDIT.jsonと内容一致、KAN-19回帰11件も既存Nodeスイートで維持。

- index.html: レポート詳細のコピー/伝播と表示ラベルのみ。
- tools/kan13-parity-dom.test.cjs: 追加5件。一致、Hit成分、複数保留、名称/互換、独立コピー。
- docs/reports/kan-13-stage2/: 報告、保全結果、テストログ。

## 未解決と適用限界

正式DPS producerは引き続き未実装。検証根拠がないDPSはnull。特殊Handlerの未接続・出典競合・条件付き効果は今回解決しない。比較のSTANDARDは装備超会心Lvを採用し、コンボ/1Hitは既存共通条件を採用する。この入力方針は変更していない。検証は代表大剣の非ゼロスキルを含む実計算経路であり、14武器すべての正式DPS/実ゲーム一致の保証ではない。Safari実機、独立エージェントレビューは未実施。

詳細伝播は新計算モデルではなく既存評価結果の診断出力。表示/JSONから検証済みと誤認しないことを既存全スイートで確認する。ゼーリエへのレビュー依頼として提出する。

## 最終テスト結果

|対象|実行・合格|失敗|skip|
|---|---:|---:|---:|
|Node（tests/*.test.cjs）|818|0|0|
|DOM（tools/*dom.test.cjs、追加5件を含む）|313|0|0|
|Browser・旧OCR・Template Gates・統合追加検証|110|0|0|
|合計|1241|0|0|

ブラウザ群はChromiumを直列実行。110件はBrowser 77件と追加検証33件の合計であり、Safari実機確認とは区別する。各ログはevidence/に保存。変更前のREDログも保存。git diff --checkは成功。最終ブランチとHEADは開始時と一致。前回1236件に対し追加5件、既存テストの削除・skip・期待値変更なし。
