# DEV_MWWSKILLSIM OCR Step 1.7

Step 1.6をベースに、OCR入力品質とTesseract側のノイズ抑制を検証する版。

## 今回の追加
1. コントラストストレッチ → 2値化
2. OCR画像への12pxパディング
3. Tesseract `tessedit_char_whitelist`
   - 辞書に存在する文字を動的に許可
   - ひらがな/カタカナを一般許可
   - `・` `ー` `αβγ` と英数字を許可
4. 既存のOCR→辞書、OCR↔OCR一致性、総合融合は維持
5. OCR回数は従来の最大6回を維持

## 比較ポイント
同じ画像をStep 1.6と比較し、
- OCR信頼度
- 生OCRの正確さ
- 辞書一致率
- OCR↔OCR一致率
- 自動確定の安定性
- 処理時間
を確認する。

Otsu、メディアンフィルタ、Tesseract内部辞書は今回まだ導入しない。
