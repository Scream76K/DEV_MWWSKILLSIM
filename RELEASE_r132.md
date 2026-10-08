# r132 — 実測動画A/Bから成分比較への接続

- `tools/evidence-component-pairing.cjs` を追加。既存の撮影条件照合を通過したガンランス・チャージアックスの実測値を成分別比較へ接続。
- 画面から読み取った各ヒットの合計と成分合計の一致を要求。未入力成分、余計な成分、ビン種別不一致、撮影条件不一致を拒否。
- 出力は `UNVERIFIED / OBSERVED_ONLY_NOT_STANDARD`。実測値からMVや砲撃・ビン係数を逆算せず、正式DPSにも昇格しない。
- UI・Technique DB・既存比較処理は変更しない。CLI/Node診断用の接続段階。
