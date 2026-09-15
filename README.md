# DEV_MWWSKILLSIM OCR Step 1.8 — 文字単位信頼度

Step 1.7を基準に、Tesseract.jsの`data.symbols`から取得できる文字単位confidenceを追加証拠として利用します。

## 狙い
- OCR回数を増やすのではなく、同じOCR結果の中から「確からしい文字」を利用
- OCR全体confidenceが低くても、武器名の一部が高信頼ならDB照合を強化
- OCR↔OCR合意、辞書一致、全体confidenceは従来どおり維持
- 高信頼になった時点で早期終了する思想を維持

## 今回変更したもの
- `data.symbols` の文字単位confidence取得
- DB候補名とOCR文字列の順序付きアライメント
- 文字単位confidenceと一致範囲を候補スコアへ少量加算
- 結果表示に「文字信頼」を追加

## 変更していないもの
- 最大OCR回数はStep 1.7と同じ6回
- OCR↔OCR合意ロジック
- 強制的な辞書候補への置換
- 画像レイアウトや本体シミュレータへの統合

## 検証
- HTML内のJavaScriptブロックを抽出して`node --check`で構文確認済み。
