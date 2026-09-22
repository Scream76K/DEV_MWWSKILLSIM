# MH Wilds OCR Step 1.25-C v4.3.4

## 変更点
- DB一致検索は0回。スクリーンショット左側12%からアイコンcoreを直接検出。
- 9個のcoreをそれぞれ独立した検出結果として扱い、行ピッチから座標を生成しない。
- DBアイコン画像はスクショ上へ重ねない。DBはgeometry calibrationの参照だけに限定。
- 検出coreサイズに対する相対比率で、仮想的なアイコン右下アンカーを算出。
- 仮想アンカーをOCR領域の基準にし、解像度・表示倍率に追従する。
- 診断表示で core / 仮想アンカー / OCR領域 / 補正量を確認可能。

## 現在のgeometry calibration
- anchor offset X = core幅 × 0.22
- anchor offset Y = core高さ × 0.21
- OCR width = core幅 × 7.0
- OCR height = core高さ × 1.0

これらは固定pxではなくcoreサイズに比例します。今後、実画面で目視検証して調整します。

## 検証順序
1. アイコンcoreの位置
2. 仮想アンカーの位置
3. OCR切り出し枠
4. OCR

OCR結果だけを見てgeometryを変更しない方針です。
