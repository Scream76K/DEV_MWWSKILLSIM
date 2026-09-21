# MH Wilds OCR — Step 1.25-C v4.0.9

## 目的
DBアイコンアンカーの位置決定は v4.0.8 のタイトDBアイコンを維持し、**実際にTesseractへ渡すOCR矩形と画面上の診断矩形の不一致を修正**する。

## 今回の変更は1点のみ
v4.0.8では `v400BuildGrid()` が「アイコン右下をOCR帯の垂直中心」とする矩形を生成していた一方、実OCR側の `equipmentNameCropRectV312()` が古い `0.08H / 0.76H / X+8` の矩形を再計算していた。

v4.0.9では、`region.ocr` をそのまま実OCR入力に使用する。

### OCR矩形
- X = icon.x + icon.width
- Y = icon.y + icon.height / 2
- W = icon.width × 7
- H = icon.height

これは「アイコン右下をOCR帯の垂直中心」「H/2上＋H/2下」という既定方針に一致する。

## 変更していないもの
- DBアイコン検出アルゴリズム
- タイトDBアイコン3枚
- 9行グリッド生成
- 5方式の前処理
- 複数OCR
- DB候補統合
- 装備DB

## 検証
- JavaScript構文チェック済み
- サンプル画像で3アンカーのテンプレート一致位置を独立検証
- 画面上の黄色OCR枠と実OCR入力矩形が同一になることを確認
