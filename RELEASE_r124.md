# r124 — 実機Hit別差分診断

r123を基準に `tools/evidence-hit-analysis.cjs` を追加。A/BのHit数と任意のHit成分ラベルを照合し、不一致時は比較を拒否。各Hitの差分と相対変化率を算出する。基準Hitが0のとき相対率はnull。実機確定・Technique DB更新・DPS実装は行わない。`tests/r124-evidence-hit-analysis.test.cjs` 6件追加。Node単体テスト147件合格、ブラウザ・実機未検証。正式8/14、参考込み9/14は変化なし。
