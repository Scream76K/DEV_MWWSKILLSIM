# MH Wilds OCR Step 1.25-C v4.2.0

## 方針変更（重要）

この版では、**DBアイコンとの一致性を使って画面内のアイコンを探しません。**

1. スクリーンショット自体の画像特徴（枠のエッジ、内部の色/変化、縦方向の反復配置）からアイコン枠候補を検出。
2. 同じX付近に連続する9個のアイコン列を構造的に確定。
3. その後でDBアイコンを参照し、**枠の幾何と右下アンカーの定義だけ**を適用。
4. DBアイコンのテンプレート一致スコアは、アイコンの存在位置の決定には使用しない。
5. アンカー確定後は、従来のOCR前処理5方式・複数OCR・DB候補照合を使用。

## DBの役割

`db_icons/weapon/` の14武器アイコンは、ビルドUIでも使用する原画像系DBです。
OCR側では、これらを画面全体へテンプレートマッチさせません。

## GitHub配置

`index.html` と同じ階層に `db_icons/weapon/` を置いてください。

```text
index.html
db_icons/
└─ weapon/
   ├─ greatsword.png
   ├─ longsword.png
   ├─ sword_shield.png
   ├─ dual_blades.png
   ├─ hammer.png
   ├─ hunting_horn.png
   ├─ lance.png
   ├─ gunlance.png
   ├─ switch_axe.png
   ├─ charge_blade.png
   ├─ insect_glaive.png
   ├─ light_bowgun.png
   ├─ heavy_bowgun.png
   └─ bow.png
```

## 注意

v4.2.0はまず「アイコン検出→アンカー→OCR枠」の接続を検証する版です。
実スクリーンショットで9個の枠が正しく検出できることを確認してから、必要に応じて検出器の閾値だけを調整します。
