# r216 保存済みビルド比較の結合検証

- 実際の `calcBuild`・`compareSnapshot`・`runBuildCompare`・`comparisonPowerIndex` と、実装済みの `genericProfileDamage` を通す回帰テストを5件追加。
- 攻撃珠・見切り珠の増加、ランナー・防御の無影響、比較後の元ビルド復元、武器種違いの比較拒否を検証。
- ダメージ用技・肉質は固定のテストフィクスチャ。ゲーム内実測値との一致検証ではない。
- 本体UI・計算式・Technique DBは変更なし。
