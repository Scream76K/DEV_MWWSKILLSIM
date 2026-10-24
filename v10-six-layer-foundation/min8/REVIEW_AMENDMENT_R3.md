# V10 min8 — 評価前プリフェッチ・封印契約（R3）

## 実装範囲
- `engine.session().prepare([requestA,requestB])` により、L2装備の解決済み結果、L3効果の通常/最大結果、Technique DB各技IDを比較開始前に読み、コピーキャッシュする。
- `prepare` 後はセッションを封印。未取得キーへのDB読取を `SNAPSHOT_UNPREPARED_KEY` で拒否。A/Bの片側だけを評価して初めて新しいDBデータを混入する経路を防ぐ。
- `pipeline.compare()` は、L1で妥当と判定されたA/Bを揃えてprepareした後、同一sessionでそれぞれをsafeEvaluateする。失敗はビルド単位に分離。
- 取得済みデータを返す際は複製し、Handler/Formulaからキャッシュ本体を変更させない。
- 追加テスト `session-seal.test.cjs`：事前取得後のProvider変更、未取得キーの禁止、二度目prepareの拒否を検証する定義。

## 制約：完全なトランザクション固定ではない
- 取得キーは比較リクエストから列挙する。Providerがprepare処理中に変更された場合、異なるキー間で一貫した時点のデータとなる保証はこのキャッシュだけではない。
- **Provider必須保証：** `openDataSnapshot(versions)` が、評価開始時に固定された装備DB・Technique DB・効果定義を参照する一貫した読取ビューを返すこと。参照ビューの寿命はprepare開始からA/B×通常/最大評価終了まで。
- 実DB AdapterではSnapshot取得の同一性と変更耐性を確認する必要がある。ハッシュ導入は必須ではない。
- 静的ソースだけではProviderが実際にスナップショット化されているとは判定できない。
- 現HEADのNodeテストは新規追加後に**実行未確認**。追加ファイルをテスト合格の証拠にしない。

## 次の品質ゲート
1. GitHub HEADを実際に取得してテスト実行。
2. 実Providerにread-viewの固定を実装し、途中更新に対する一貫性を実証。
3. ゼーリエが指摘した6層責務境界・比較条件・単位について再レビュー。
