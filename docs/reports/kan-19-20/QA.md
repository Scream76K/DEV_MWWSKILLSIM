# フェルン・ヒンメル QA最終記録

フェルンが新規fixture/DOM/Browser/隔離runnerと既存初期化を整備。最後の全回帰はヒンメルが実行。Node v24.19.0、Playwright Chromium、一時コピー `/private/tmp/kan19-20-regression-DDQwJ1`。tools/kan19-20-temp-regression.cjsを使用、UI_PHASE=after。監査JSON等の書込はコピー内。元1089ファイル変更0。

| 対象 | 初回成功/失敗 | 最終成功/失敗 | skip |
|---|---|---|---:|
| Node | 689/102 | 798/0 | 0 |
| DOM | 233/70 | 308/0 | 0 |
| Browser | 60/17 | 77/0 | 0 |
| smoke | 16/0 | 16/0 | 0 |
| 旧OCR | 11/0 | 11/0 | 0 |
| Template | 6/0 | 6/0 | 0 |

初回Nodeは追加39件、最終は46件。DOM初期化失敗時303件、最終308件。test名/skip不変。既存60fixtureのassert59完全一致、r139だけ新保留guard構造検査追加と旧raw参照検査維持、数値期待変更0。最終全60SHA一致。file別初期化理由/前後SHAはevidence/qa/assert-fixture-audit.json。

C: VM共通モジュール/helper未登録・生JSDOM外部JS非読込。B: 意図した非属性合成fixtureのspecials未指定・装備選択後calcBuild欠落。A: 状態異常HP加算、直接入口unknown0、異種成分比、手入力数値string拒否、提案基準状態欠損。製品AはRED→GREEN回帰で修正。未知を0にする製品側回避はしていない。

新規DOM4、Browser1、契約46は最終上表内。実Chromiumで9SVGと5幅を検証、Mac Safari実機/公式MHDB数値確定とは区別。初回/RED/finalログを保持し、失敗を合格として隠さない。
