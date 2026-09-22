# MH Wilds OCR — DBアイコン照合検証 v0.3

v0.2でOpenCV.jsの`onRuntimeInitialized`登録順が原因で「OpenCV.jsがまだ準備できていません。」から進まない可能性があったため修正。

- `Module`をOpenCV.js読み込み前に定義
- コールバックはグローバルフラグだけを立て、後続スクリプトのTDZを回避
- `cv.Mat`を200ms間隔でポーリングするフォールバックを維持
- DBアイコン照合→重ね合わせ→右下角→H/2上下OCR帯の検証ロジックは変更なし

※OpenCV.jsは`https://docs.opencv.org/4.x/opencv.js`から読み込みます。インターネット接続がない環境では準備完了になりません。
