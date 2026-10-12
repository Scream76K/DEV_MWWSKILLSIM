# 第4段階の変更ファイル

開始時ハッシュとの照合。Git HEADとの差分には以前の未コミット成果も含むため、本段階の差分判定に使用しない。

- `index.html`
- `tests/r192-dps-build-parity.test.cjs`
- `tests/r248-independent-dps-diagnostics.test.cjs`
- `tools/ai-comparison-browser.test.cjs`
- `tools/ai-comparison-dom.test.cjs`
- `tools/canonical-combo-dom.test.cjs`
- `tools/canonical-timing-browser.test.cjs`
- `tools/canonical-timing-dom.test.cjs`
- `tools/charge-blade-combo-browser.test.cjs`
- `tools/charge-blade-combo-dom.test.cjs`
- `tools/combo-evaluation-dom.test.cjs`
- `tools/combo-persistence-dom.test.cjs`
- `tools/combo-verification-dom.test.cjs`
- `tools/comparison-baseline-browser.test.cjs`
- `tools/comparison-baseline-dom.test.cjs`
- `tools/comparison-index-browser.test.cjs`
- `tools/comparison-index-dom.test.cjs`
- `tools/comparison-report-browser.test.cjs`
- `tools/comparison-report-dom.test.cjs`
- `tools/comparison-rounding-dom.test.cjs`
- `tools/expanded-combo-dom.test.cjs`

新規回帰：tests/r250-dps-verification-gate.test.cjs（Node6）、tools/r250-dps-verification-dom.test.cjs（DOM2）、tools/r250-dps-verification-browser.test.cjs（Browser1）。本報告書・証跡を新規作成。
