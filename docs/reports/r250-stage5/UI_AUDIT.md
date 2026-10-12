# Stage5 KAN-7 UI監査 — stark（シュタルク）

対象: `/Users/scream/Projects/DEV_MWWSKILLSIM-r250`、`codex/integrate-r249`、HEAD `fb6d82cd525da9273af10ac6b719f330208608c5`。起動時一致確認。実施日2026-10-11 JST。Stage5の専有証跡・報告作成許可に基づく。製品修正0件、DB/既存tests変更0件、Git変更操作0件、原本/GUILDアクセス0件、再委任0件。

## 実行条件と証跡

実Chromium headless（Playwright）、viewport高1000、幅375/390/768/1024/1440。page.routeで指定worktreeのindex/local JS/assetsを供給し、外部通信を遮断。実Technique DBを読み込み、装備のみ既存r249 integration方式を参考に合成fixture（大剣2件、短い名称、攻撃スキルLv1、未装備防具、自由護石）をページメモリへ投入。技登録は合成MV20/1秒をコミュニティ資料として端末内に登録。ゲーム性能の検証やverified昇格ではない。全detailsを開いたストレス表示である。

初回ChromiumはmacOS MachPort sandboxで起動不可。承認済みrequire_escalated実行で起動成功。初回監査のtechSourceへのfillはselectに対する監査側の誤りで、selectOption('community')へ訂正して40領域を全再取得。最終結果に初回失敗を成功として混ぜていない。

証跡: `evidence/ui/audit.cjs`（再実行手順）、`results.json`（操作結果・本文・寸法・pageerror）、`{width}-{area}.png` 40枚、`{width}-contact.png` 5枚。view_imageで5枚の全40領域contact sheetを新規視覚確認し、375-equipment/390-comparisonは原寸でも確認。viewport証跡であり、長い領域の下端すべてを1枚で示すものではない。

## 40領域の実施成否

|領域|実操作|375|390|768|1024|1440|
|---|---|---|---|---|---|---|
|装備|合成大剣切替・計算ボタン|完了|完了|完了|完了|完了|
|スキル|攻撃Lv1表示・再計算|完了|完了|完了|完了|完了|
|技|名称/時間/MV入力、資料種別選択、追加登録|完了|完了|完了|完了|完了|
|コンボ|技選択・追加|完了|完了|完了|完了|完了|
|DPS|計算ボタン・時間未確認の保留表示|完了|完了|完了|完了|完了|
|保存比較|2ビルド保存・全選択・比較出力|完了|完了|完了|完了|完了|
|OCR|埋込UI表示・装飾品スキップ|限定完了|限定完了|限定完了|限定完了|限定完了|
|テンプレ|武器種・テンプレ選択、説明表示|限定完了|限定完了|限定完了|限定完了|限定完了|

最終40操作例外0、pageerror0、画像40/40。DPSは実際に「所要時間未確認のため算出できません」を表示し、架空時間で補完しなかった。保存比較は通常/最大2件、DPS0件保留。OCR実画像解析・反映、テンプレ実MHDB反映の成功を意味しない。画像名のareaは equipment/skills/technique/combo/dps/comparison/ocr/template。

## 再現した所見

- **P2: ページ全体の横overflow**。375pxでdocumentElement.scrollWidth−innerWidth=34px、390pxで19px。両幅の全8領域で再現。768以上は0px。追加の2幅Chromium読取でdocument/Shadow DOM要素box右端超過0件、文字Rangeでは原因特定。#techAuditPanel内「参照資料」LIのMACARONGAMEMO_DUAL_BLADES_VER1020が右端408.6875px・文字幅341.6875px。#techAuditPanelまたは内側「参照資料」を閉じるとdocument幅375/390へ戻る。比較table生成前にも再現し、意図した局所scrollとは別。evidence/ui/overflow-probe.json/.cjs参照。画像375-ocr/390-ocrとresults.json参照。改善案は参照資料の長い識別子へ折り返しを許す表示調整。初期折りたたみ状態は解消し、資料展開時に発生するためP2。製品未修正。
- **P2: 比較保留理由の低コントラスト**。390-comparison原寸で暗青背景に暗褐色の計算状況・理由が表示され読みにくい。5幅contact sheetにも同傾向。文言を消さずsupport領域の文字色を調整する表示案。定量コントラスト比は未測定。
- **P2: 装備/スキルの狭い2列**。375-equipment原寸でスキル見出し、攻撃力・最大会心率ラベルが途中改行し、右列の注記と状態表示が縦長。390でも同傾向、768のasideではさらに狭い。読取・ボタン操作は成立したため操作不能とは分類しない。領域幅に応じた列組みの改善候補。

P0/P1の再現なし。ただし40小規模シナリオに限った判定で、製品全体の不存在保証ではない。比較結果より上に診断操作が多く縦移動が長い点も観察したが、既知の表示改善候補として上記P2より低い優先度。

## 未検証と影響

実MHDBの長い名称・大量スキル/大量保存行・全装備スロットの充填、全武器、実画像OCR/誤認識からの確定操作、テンプレ実DB反映、タッチ実機・ネイティブiOS/Safari、キーボード/スクリーンリーダー、数値正当性は未検証。短名fixtureで文字切れがないことを長文へ一般化しない。headless Chromium desktop viewportでありiPhone実機と同一ではない。装備fixtureと合成技はsource_confirmed/verified根拠にはならない。

他担当: fernは再現3件の回帰/実機切分け、eisenはShadow DOM幅境界、seinは実画像OCR、himmelは表示修正採否を判断。計算/DB担当への数値変更なし。優先案は横overflow原因切分け→保留理由文字色→狭幅列組み。修正は別の承認済みタスクで行う。

統合提案: 監査証跡と本報告は統合可。限定完了と未検証を保持し、全機能・実機合格として扱わない。
