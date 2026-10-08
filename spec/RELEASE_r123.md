# r123 — 実機A/B撮影データ比較ゲート

r122から `tools/evidence-pairing.cjs` を追加。撮影データA/Bについて装備、対象部位、距離、バフ、会心条件、ゲームVerの一致を確認し、スキル条件が異なる比較のみ許可する。各Hitの合計と対基準増減率を算出するが、計算式の正確性やTechnique DBの検証済み昇格を意味しない。未確認の撮影条件は比較不可。

`tests/r123-evidence-pairing.test.cjs` 7ケース追加。既存UI・Technique DB・計算Handlerは変更なし。実機照合未完了、武器対応率は変更なし。
