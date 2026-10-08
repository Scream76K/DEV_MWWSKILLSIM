# r122 — 実機検証エビデンス受付の入力検査

r121に対して `tools/evidence-intake.cjs` と `tests/r122-evidence-intake.test.cjs` を追加。
14武器ごとの入力テンプレートと撮影データの受け入れ条件を定義し、装備、スキルLv、対象、命中数字、状態、ゲームVerをチェックする。
入力が揃っても `UNVERIFIED` のまま保持する。実測値のTechnique DB自動昇格は行わない。
ダメージ計算、UI、武器対応率は変更なし。実機検証は未完了。
