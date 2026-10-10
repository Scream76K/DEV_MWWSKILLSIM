# r153 — 実測コンボの不完全データを安全に集計

- ガンランス実測コンボの既知ダメージ `knownDamage` と既知Hit数 `knownHits` を明示。
- 未計測Hitを含む場合、`hitsComplete=false` / `totalHits=null` として、既知Hitを総Hitと誤認しない。
- 未計測ダメージを含む場合、`totalDamage=null` / `dps=null` を維持。既知ダメージのみ別途表示可能。
- ダメージ不明イベントに付属するHit数も検証し、値が判明していれば集計。
- r153新規5テスト追加。Technique DBの値・公式検証フラグは変更しない。

**制限:** 実測値の照合モジュールであり、汎用砲撃ダメージ計算式への接続は未完了。
