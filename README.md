# MHWilds OCR v4.4.6
- RAW画像ピクセル座標を解析座標として使用。
- アイコンDB検索は0回。
- 装備UIの右境界候補を複数探索。
- 水平線の「長い連続性」を利用して10境界→9行を検証。
- pitch/H と 8pitch/H、内部境界強度、画像内収まりを必須条件化。
- OCRはこの段階では実行しない。
- 速度より検証精度を優先したプロトタイプ。

## 内部シミュレーション（リリース前検証）

同じ装備画面 `IMG_9443.jpeg` をサイズ変更して、RAW座標を変えずに検出ロジックを検証した。

| ケース | 画像サイズ | 判定 | pitch/H | 備考 |
|---|---:|---|---:|---|
| 原寸 | 706×1536 | 9行成立 | 0.0833 | 境界は約340,468,596,724,852,980,1108,1236 |
| 1/2 | 353×768 | 9行成立 | 0.0833 | pitchも約64pxへ比例 |
| 2倍 | 1412×3072 | 9行成立 | 0.0833 | pitchも約256pxへ比例 |
| 4Kレターボックス想定 | 3840×2160 | 9行成立 | 0.0833 | 左側UIとして配置した場合 |
| 横長サンプル | 1340×760 | 9行成立 | 約0.0850 | 装備欄を選択し、旧v4.4.0の誤周期を回避 |

### 今回の4K誤検出に対する安全確認

旧v4.4.0が実際に検出した `pitch=129 / H=2160 = 0.0597` のような周期は、v4.4.6の `pitch/H=0.070～0.095` 条件では9行Gridとして採用しない。

また、9行全体が画像内に収まること、内部8境界の連続性、9行全体の高さ（8pitch/H）も同時に検証する。

### 重要

これは「OCR成功版」ではない。まず9行の幾何検出を安全に成立させるための版であり、9行が成立しない場合は後段OCRへ渡さない。


## v4.4.6 ROI integration
- Gemini-derived 16:9 effective game-area calculation.
- 7 equipment-name ROIs only: main weapon, head, chest, arm, waist, leg, charm.
- Sub-weapon and mantle are excluded from OCR targets.
- ROI uses normalized ratios, not fixed pixels.
- Added ROI preview and 8-size self-test.
- Fixed the v4.4.2 top-down grid button click hook.
- The new ROI calculation is kept separate from legacy OCR assignment until position validation is complete.


## v4.4.6 internal validation change
- Gemini's normalized 16:9 ROI is retained as the baseline.
- Internal simulation against `sample_game.png` showed the baseline Y positions aligned with the category labels rather than the equipment-name line.
- Added a local name-line refinement: search below each baseline ROI for the lower white/neutral text band and shift the OCR ROI to that line.
- The original ratio ROI remains available for direct comparison.


## v4.4.6 装飾品スロット切り出し検証
- 16:9ゲーム領域を共通座標系として使用。
- 左側装飾品パネルの横方向エッジプロファイルから境界候補を抽出。
- 25本の境界から24個の論理スロットを動的に確定。
- 単純な固定Yピッチ24行生成ではなく、画像内の実測境界を使用。
- 各スロットの名前ROIを境界間から生成。ROIは行ごとの実測pitchに追従。
- 空きスロットは画像処理段階で削除しない。後段の珠DB照合で「対照なし」にできる。
- 装備DBのスロットLv情報は後段の候補選定・対応付けに利用する前提。
- OCR・珠DB照合はまだ接続しない。
- decoration_reference_IMG_9323_1.jpeg は今回の検証用基準スクショ。


## v4.4.6 変更点
- 装備画像と装飾品画像の入力欄を完全分離。
- `equipmentContext` と `decorationContext` を独立保持。どちらか片方だけでも解析可能。
- 「🔄 解析結果をビルドへ反映」ボタンを1つに統一。存在する解析結果だけを反映データへまとめる。
- 反映データを `window.buildReflectionState` に保持し、`mhWildsBuildReflect` イベントで将来のシミュレータ本体へ接続可能。
- 装飾品ROI検出は装飾品専用画像を使用。装備画像とは混在させない。
