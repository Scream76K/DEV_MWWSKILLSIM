# MHWilds OCR v4.4.1 Coordinate Audit

v4.4.0の検出処理を変更せず、座標系だけを監査する版です。

1. 4K画像を読み込む
2. 「座標系を監査」
3. 「トップダウン9行を検証（監査付き）」
4. 再度「座標系を監査」
5. ログを共有

監査対象:
- naturalWidth / naturalHeight
- img CSS表示サイズ
- 解析ImageData
- TopDown Canvas buffer/CSS
- Gridの入力座標
- Grid→Raw倍率
- pitch/H
