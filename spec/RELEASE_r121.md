# r121 — 全14武器の実機撮影マニフェスト整備

r120からの変更：`tools/capture-manifest.cjs`、`R121_CAPTURE_MANIFEST.json`、`tests/r121-capture-manifest.test.cjs` を追加。
14武器の撮影対象、固定STANDARD 8・参考1・保留5、必須記録項目、動画ファイル名を機械可読化した。撮影を行っても数値や検証状態を自動昇格させない。

検証：`node --test tests/*.test.cjs` 130/130 PASS（r120時点の127件に3件追加）。ブラウザ・DOMテストおよび実機照合は未実施。

本版は撮影準備用の開発ツール追加であり、火力比較対応率は8/14、参考を含め9/14から変更なし。既存計算式・Technique DB・UIは変更しない。
