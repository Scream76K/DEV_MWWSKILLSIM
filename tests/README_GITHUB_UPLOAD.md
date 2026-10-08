# r139 テストコード

43個の `.test.cjs` を `tests/` 直下にアップロードしてください。

既存のJSONは `tests/fixtures/` に保存されているため、一部テストが参照する `tests/*.json` と配置が異なります。テスト実行前に参照パスの統一が必要です。

実行例（Node.js）： `node --test tests/*.test.cjs`
