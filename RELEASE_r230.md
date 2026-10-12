# r230 実測資料と稼働Technique DBの直接照合

- `tools/build-gs-live-crosscheck-r230.cjs` は実際の `index.html` Technique DB をロードし、ユーザー提供の実測12行と比較。
- `GREAT_SWORD_LIVE_CROSSCHECK_r230.json` に現在値、実測値、差分、履歴後値の一致判定、出典、バージョン未確定フラグを保存。
- 溜め斬りⅡ: DB 136 / 独立実測 135 / 1.021.00履歴後 135。独立実測と履歴の一致は確認できるが、1.042.00.02への適用は未確定。
- `tests/r230-live-gs-crosscheck.test.cjs` で将来の無断数値変更や技バリアント混同を検出。
- DB・計算式・UIは変更しない。
