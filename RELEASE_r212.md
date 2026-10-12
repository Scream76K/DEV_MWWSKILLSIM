# r212 — 装飾品変更からビルド火力指数までの結合テスト

- 実際の `calcBuild()`、`compareSnapshot()`、`comparisonPowerIndex()` を接続した5ケースを追加。
- 攻撃珠・見切り珠の交換、スロット縮小、不適合珠、武器種・STANDARDプロファイル不一致を検証。
- STANDARD火力の数値生成のみテスト用固定式を使用。実際の `standardPowerForStats()` 全計算の数値精度を検証したものではない。
- 本体の計算式・保存形式・Technique DB は変更なし。
