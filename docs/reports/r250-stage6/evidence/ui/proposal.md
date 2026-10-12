# KAN16 最小CSS案（himmel専用統合）

index.htmlのcomparison-layout-containment styleの後、head末尾に局所styleを追加する案。既存CSS行は消さない。製品編集は担当から実施していない。

```css
/* KAN16: local readability; retain game skill blocks and internal two columns. */
#techAuditPanel li { overflow-wrap:anywhere; }
#compareOut .compare-note,
#compareOut .compare-note .small { color:#d5e1ed!important; }
#armorBuildWorkspace { grid-template-columns:minmax(0,1fr)!important; }
#skillWorkspaceRight .skill-game-grid { grid-template-columns:repeat(2,minmax(0,1fr)); }
#skillWorkspaceRight .skill-game { min-width:0; }
#skillWorkspaceRight .skill-game-name { overflow-wrap:anywhere; }
```

1. 資料LI識別子の折返しのみ。overflow:hiddenによる切捨てではない。
2. #compareOut内の説明/理由文字のみ。非正規化数値行・白系表・ゲーム風茶系装備・global色変数変更なし。#comparisonReadinessと保留理由が同じ暗背景上にあるためcompare-note系統に限定する。
3. 外側workspaceはaside300px/モバイル351-366pxしかなく、3:2配分で技能列119-146px。外側を縦積みにし両パネルへ全幅を割り当てる。内側2列は別契約で必ず維持。global .grid/.twoや無関係なskill-game-gridへ影響させない。

先行回帰: tools/r250-stage6-ui-browser.test.cjs。before-test.log/measurements.jsonと15画像は現製品から生成済。5幅、資料展開overflow、実グラデーション背景PNGサンプルとのSC1.4.3（通常12pxテキスト4.5:1）コントラスト、内部2列、外側全幅、装備選択/保存比較/table固定352px/.two境界/数値算出を検査。表示DOMだけ16個の長い名称blockへstress複製し、計算stateは改変していない（合成UIfixture）。技DB・MHDB実値の検証ではない。

背景測定は文字だけ透明にして同じ位置の背景PNGを取得後、style復元。8px刻みRGB（1140-1344サンプル）からsRGB相対輝度の最小比を算出。透明背景を白と見なす誤計測は除外。before foreground rgb(90,74,56)、実背景先頭rgb(28,41,54)、最小contrast1.7406、1440幅1.7610。W3C https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html （2026-10-11確認）。

統合後にUI_PHASE=afterで同回帰を実行しGREENとafter画像を確認する。統合通知前のGREEN実行はしない。
