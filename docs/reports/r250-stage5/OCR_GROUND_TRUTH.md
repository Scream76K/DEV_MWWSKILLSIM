# KAN-8 OCR ground truth 再監査（ザイン）

2026-10-11。対象 `/Users/scream/Projects/DEV_MWWSKILLSIM-r250`、branch `codex/integrate-r249`、HEAD `fb6d82cd525da9273af10ac6b719f330208608c5` を開始時確認。一致。AGENTS.md/sein role受領。製品・DB・tests・Git変更0、再委任0。作成範囲は本報告と専有 `evidence/ocr/` のみ。

## 判定

実画像goldenはフルスクリーン/上下黒帯/枠撮影の **0/3系統**。4種類を `view_image(detail=original)` で確認し、SHA256がStage3記録と一致することを再確認した。画像の存在・装備9行の目視確認と、物理image→viewport→9行boundary→cropの正解座標確認を区別する。unknownのviewport/境界/name bbox/cropはnull。座標を目視推測、過去係数、検出結果から埋めていない。

| 画像 | 実視覚結果 | truthとして使える範囲 | golden可否 |
|---|---|---|---|
| sample_game.png 1340×760 | 装備9行全体が見える。黒い外枠と白い外側領域。文字はぼけている | 枠付き画面の注釈候補。行順・全9行の存在の質的確認 | 枠撮影系の候補に留まる。未加工実機原画像/撮影方法/四隅の測定/10境界/名前bbox未確定 |
| examples/equipment_example.jpg 706×1536 | 装備列は9行見えるがゲーム画面の横方向は部分拡大。上に電話status、下にbrowser UI、名前に青い注釈 | 部分表示・注釈混入の負例。5防具名の目視/MHDB手動照合根拠はStage3にある | 画面全体viewportを復元できない。3系統の全viewport goldenに使用不可 |
| simulation_result.png 1099×623 | sampleと同じ場面に旧青/黄検出枠・スコアが重畳。黄枠は右側まで伸びる | 旧検出結果の資料 | 原画素truthとして不採用。重畳枠を正解として転記しない |
| examples/decoration_example.jpg 1536×864 | 枠/browser UIなしの16:9ゲーム画像。左側は装飾品選択一覧、右側はskill/status | 装飾品画面の全画面候補 | 装備名9行画面ではない。装備9行goldenには不採用。別の装飾品注釈課題 |

`decoration_reference_IMG_9323_1.jpeg` はStage3 inventory上でdeco例と同hash。今回は4種類の目視確認を数え、重複画像を5件目の独立証拠として数えない。

## truth / 検出結果 / 合成の分離

- **独立truth**：寸法とファイルhash、画像内の画面種別・枠/注釈の存在まで確認。正解viewport・10境界・7装備名bbox・cropは未測定、null。
- **実画像の検出結果**：Stage3 `evidence/real-ocr-result.json` の実Tesseract2画像、7部位ずつ、auto0/7。sampleのgameAreaは `[0,3.125,1340,753.75]`、phoneは `[0,569.4375,706,397.125]`。これらは中央16:9仮定の算出値で、viewport truthではない。phone武器ROI `[34,644,87,16]` は目視の武器行とは異なる位置。refined=trueや画像内検証OKでも行同定成功にはならない。
- **合成truth**：`tools/r250-ocr-coordinate-browser.test.cjs` は既知のoffsetと9色行を構築し、ROIをcrop関数へ直接渡す。全画面960×540、上下黒帯960×660/offset(0,60)、枠1100×700/offset(70,80)。crop矩形・原画素色・CSS独立を確認する試験であり、viewport/9行の検出器を呼んでいない。ザイン個人は再実行していないが、ヒンメルのStage5全Browser回帰で3件を再実行して全て成功した。根拠は `evidence/browser-baseline.log:83–85`、全体66成功/0失敗は同ログ88–91行。Stage3/Stage5の合成3/3成功を実画像検出成功へ昇格しない。

## 経路・座標契約

公開 `workflowEquipmentOCR → calculateEquipmentROI → calculateEquipmentROIsRefined → calculateEquipmentROIs → calculate16by9Area` は画像寸法だけから中央16:9領域を仮定し固定比率7ROIを作る。黒帯/外枠の実検出ではない。`refineEquipmentNameROI` は既存ROIの局所縦profileの最大peakを名前帯として運ぶ。

独立 `tdRun → v400ImageData → tdDetectTopDown` は物理画像全体の高さ/幅を基準にpanel/水平境界/9行を探索し、`window.topDownGridResult` に保存する。公開 `equipmentROIResult` への接続はない。viewport内での正規化とは異なる。

Stage3で補修されたw/h source crop保持、失敗時状態消去はcrop受渡し/状態安全性の修正。画像条件の係数校正ではない。係数変更・Tesseract再測定・golden昇格は今回なし。

## 過去値の扱い

2026-09-24の3840×2160、viewport(0,0,3840,2160)、x184/w472/h69、Y309/708/903/1099/1294/1489/1693はユーザーの過去7ROI参考記録。原画像path/time/hashと10境界が結び付いていないため `HISTORICAL_REFERENCE_NOT_GOLDEN` を維持。名前ROIのYを9行境界に流用しない。17.8%/8.7%/7.8%は未確認の提案値で、校正に用いない。

資料が示す外部MigrationバックアップはStage3 inventoryで4種類と同hashの複製。Downloads指定folderに画像なし、ZIPに戦闘画像のみという記録で、新規原画素の根拠はない。今回外部ファイル・原本repo・GUILDにはアクセスせず、広域探索もしなかった。

## 追加撮影と測定手順

1. 同じゲーム版・言語・UI倍率・装備構成で9行全体（main/sub/head/chest/arms/waist/legs/charm/mantle）を含む実機原PNGを採取。版、解像度、capture方法、リサイズなし/加工なし、撮影日時、hashを記録。可能なら過去4K記録の原画像を指定してもらう。9行を隠すmenu/注釈なし。
2. フルスクリーンは画面全域を欠損なく保存。上下黒帯は帯を含む元画像と元ゲーム領域の条件を保存し、黒帯追加の合成は別分類。枠撮影はscreen四隅と枠/9行全体が見える未加工写真を採取。傾き/遠近がある場合、四隅quadrilateralとrectification transformを保存し、単純rect crop成功とは別に扱う。
3. 検出器を走らせる前に、原画素上でviewport四隅/矩形、装備列の10水平境界、7名前bboxを独立手動測定。上/下端は行名ラベル/名前行と混同しない。名前bboxは先頭/末尾・αβγ・上下面を含む。測定者、二者照合、許容誤差の決定根拠を記録。目視の仮値はreview待ちとしgoldenにしない。
4. 軸平行viewportの正規化は `u=(x-vx)/vw, v=(y-vy)/vh`、物理への復元は `x=vx+u*vw, y=vy+v*vh`。round/clamp規約を固定し、四隅/境界のround-trip、画像/viewport内包、部位順、名前全体包含、overlayと実drawImage source矩形の一致を検証。CSS/画面表示座標はtruthに使わない。
5. 三系統ごとに独立注釈が揃ってからgolden候補→二者承認→detector比較へ進む。失敗/拒否も記録。bbox正解と画素crop一致を先に判定し、Tesseract/MHDB精度は次段階。係数調整は画像に結び付いた別承認タスク。

## 影響・次案

KAN-8は「根拠監査完了、実機golden不足」と報告できる。検出精度/3系統対応の完成扱いは不可。次の実装前ゲートは原画像条件の確認と注釈・座標契約であり、既存検出値をexpectedへコピーするテストではない。画像不足のため未確定箇所をnullで保持した監査JSONを `evidence/ocr/ground-truth-audit.json` に保存した。
