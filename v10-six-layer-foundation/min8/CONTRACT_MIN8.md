# V10-min8 — 6層単一Pipeline統合契約

## 実装状況
独立したNode試作。`pipeline.cjs` が単一の公開入口で、min2の `inputAdapter`（L1）、`buildResolver`（L2）を実行し、L3の効果定義を検査した後、min7のイベント駆動L4と唯一のL5を使用する。L6は同じ評価関数の結果を表示・比較へ変換する。旧min2 resultAggregatorとmin5 event-engineは呼び出さない。

## 主要API
- `createPipeline({versions, openDataSnapshot, initialState, handlers, formulae})`
- `.evaluate(source)`：L1〜L5 の1ビルド計算。
- `.safeEvaluate(source)`：共通入力やL2で失敗しても理由付き結果を返す。
- `.compare(a,b)`：同一スナップショットセッションでA/Bを独立評価し、A通常を共通分母とした比較を実施。
- `.present(source)`：単独評価結果を表示用エンベロープに変換。

## 実装境界
- L1: `schemaVersion='v10-min2'`、技ID順、target、evaluationを検査。
- L2: MHDB基礎値、装備ID、スキルID/Lv/rank、装備DB版と出典を検証し、未解決基礎値は拒否（暗黙に0にしない）。
- L3: stage/target/unit/order/condition/sourceを維持した効果定義を返す。イベント時点の条件判定はL4共通効果処理が所有。開始条件のみのmin2効果Resolverは**呼ばない**。
- L4: 同一評価セッションでTechnique DB参照をキャッシュ、Hit/consume/transitionのイベント順を管理し、HandlerからDB成分IDだけ受領。成分の係数・単位・出典はDBレコードを使用する。
- L5: min7 `aggregate()` のみが完了判定、総計、DPSを決定する。実行計画未完了は総計・DPSを未算出とする。
- L6: 同じ評価を呼び出し、A/Bの片側失敗を局所化。相対比較はA通常基準で絶対値を変更しない。

## 重要な制限（完了判定の対象外）
1. `openDataSnapshot` が同一セッション内で不変のデータを返す義務を持つ。現時点では `versions` 一致・窓口存在を検証するだけで、**実レコード内容の不変性を機械的には検証しない**。
2. 対象版やTechnique DB実スキーマとのAdapter照合は未実施。既存製品の保存JSON/UIへ接続していない。
3. min7 `applyEffects` の段階別効果演算は骨格用であり、全スキルの丸め・適用順序・特別な上限を検証したものではない。
4. min7とmin8では内部 `engine.cjs` のL4〜L5を再利用しているが、現行リポジトリの製品コードには未統合。
5. 既存L2契約の表示属性値/基礎会心を計算用数値へ写しているが、単位対応の実DB照合が必要。
6. min7の `conditionKey` は評価入力と技版署名に依存する。実対象条件の正規化およびDBレコード内容の固定は未完成。

検証：min8統合8件。ゲーム固有数値はテスト用のみ。実製品の14武器・ブラウザE2Eは未実施。
