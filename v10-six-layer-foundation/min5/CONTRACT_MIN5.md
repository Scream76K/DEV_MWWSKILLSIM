# V10-min5 単一6層Pipeline 統合検証

## 状態
独立した構造試作。既存 `index.html`、実MHDB・Technique DB、14武器Handlerは未接続。ゲームの火力計算式は未実装。**構造完成とは判定しない。**

## 正式な呼出経路
`pipeline.evaluate(input)` → L1 `inputAdapter` → L2 `buildResolver` → L3 `effectResolver`（通常／最大を隔離）→ L4 `compilePlan` + `executeChannel`（Technique DB共通窓口とイベント単位状態）→ L5 **`aggregate` のみ** → `EvaluationResult`。`present` / `compare` は同一 `evaluate` を経てL6 `presentationAdapter` が処理する。

## 完了判定
L4は予定イベントIDと実行イベントIDを返す。L5は不一致または未完了を `EXECUTION_INCOMPLETE` として扱い、成分内訳を保持しつつ総計とDPSを非表示にする。時間だけ未確定なら総ダメージは保持する。条件付き効果が不明なら未発動・0に置換しない。

## 版と比較
`{game,equipment,technique,effects}` をPipeline生成時に固定する。A/Bも同じPipelineオブジェクトを利用する。Technique DBのレコードにはID・revision・dataVersionを要求する。比較キーにはターゲット、肉質、技順署名、技revision、各DB版を含め、装備やスキルは比較の差分として許す。相対値の共通分母はA通常。

## API統合上の制約
L3の `condition` は今段階では開始時に真偽が確定するBoolean datumのみ許す。技中に変化する条件を扱うには、L3から条件定義を渡してL4共通効果Applicatorが各イベントの状態で評価できる契約へ拡張する必要がある。Effectの適用順・段階・単位の検証も本格DB接続前に再レビューが必要。

## 残る構造リスク
- L4のイベント種別はHitとtransitionのみに限定。消費・状態変更・イベント途中の条件成立を型として拡張する必要がある。
- `compilePlan` は、DBレコードを各 `evaluate` 呼出時に再取得する。版番号は固定するが、同じ版の内容不変性はまだ保証しない。
- 技DB成分の係数・単位・出典の照合は試作スキーマに依存。実DBとのAdapterは未接続。
- 集約は `min4/event-engine.cjs` の `aggregate()` が唯一の所有者。ただし元のmin2単体API `resultAggregator` は旧モジュールに残っている。統合Pipelineからは呼ばない。
- L4の `applyEffects()` は開始条件のBooleanだけを使用。実機のHit中条件を完成したものと見なさない。
- CommonJSのWeb利用方法、保存JSON互換、3画面入口の置換は未実装。
- 現骨格の比較キーは技DBレコードのrevisionを確認できるが、DBそのもののハッシュ固定には非対応。

## テスト
統合10件、旧min2契約11件、min4独立11件の計32件、Nodeによる検証。実製品テストではない。
