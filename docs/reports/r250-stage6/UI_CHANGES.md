# KAN16 — stark（シュタルク）UI変更検証

指定r250 worktree/branch/HEAD一致確認済み。Stage4/5成果と製品/DB/既存tests未変更。index編集はhimmelのみ。

現段階: himmelのhead末尾stage6-ui-readability統合後GREEN確認済み。先行Browser RED実施済み。専有evidence/ui/proposal.mdに具体CSS案、新規tools/r250-stage6-ui-browser.test.cjsに5幅先行回帰。証跡before-test.log、before-measurements.json、before-{幅}-{workspace/comparison/reference}.png15枚。

確定仕様spec/01_DATA_AND_EQUIPMENT.md:9は発動スキルのゲーム風block・内部2列。現コードindex.html:35は内部1列に上書きし、外側workspaceの3:2配分と異なる。案は外側を縦積み全幅化、内部2列復元を明確に分け、局所ID selectorで無関係なgridを保護。

before測定: 375 overflow34px/390 overflow19px、768以上0。資料ID文字Rangeのはみ出しはStage5同条件再現。内部1列、右パネル幅139.61/145.61/119.19/119.19/119.19px。比較説明foreground rgb(90,74,56)、実gradient背景PNGサンプリング最小contrast1.7406、1440は1.7610。透明な祖先背景を白扱いせず、文字色を一時透明にして背景のみPNG取得しstyle復元した。サンプル1140-1344点。12px通常説明文字の基準4.5は[W3C WCAG2.2 SC1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)（2026-10-11閲覧）。画像からの目視でも暗背景上の暗褐色を確認。

保護回帰: .two既存760境界、比較table352px・局所scrollを維持、装備選択・計算・2ビルド保存比較、pageerrorなし。afterでは非正規化power/maxをbefore同幅と一致確認する。見切れ隠蔽のglobal hiddenや固定scroll高さは案に含まない。

fixture: 合成大剣2件/攻撃・見切りLv1、表示stressとして長名スキルDOM14個を複製し計16個。数値stateは不変。実MHDB長名/全装備/iOS実機/実画像OCR未検証。verified昇格なし。統合通知後GREEN/after画像を以下に記録。


## 統合後GREENと目視

新規実Chromium回帰26件成功、失敗0・skip0・pageerror0、exit0。beforeは26件中8成功/18失敗（親集計1失敗を含み、子25件は8成功/17失敗）。before時点でREDを確認してからhimmelが提案CSSを統合した。after-test.logとafter-measurements.json、after画像15枚と5contactを保存。view_imageでafter5幅全15領域を確認し、暗い理由文字の改善・外側全幅・内部2列のゲームblockを目視。画像はviewportなので全16skillの全縦範囲を1枚に保証しないが、DOM回帰で16件・2列を測定。ブラウザは終了済み。

|幅|ページoverflow before→after|説明contrast before→after（表示用丸め）|右panel幅 before→after|内部grid after|
|---|---|---|---|---|
|375|34→0|1.7406→11.1438|139.61→351.00|157px 157px|
|390|19→0|1.7406→11.1438|145.61→366.00|164.5px 164.5px|
|768|0→0|1.7406→11.1438|119.19→300.00|130.5px 130.5px|
|1024|0→0|1.7406→11.1438|119.19→300.00|130.5px 130.5px|
|1440|0→0|1.7610→11.2743|119.19→300.00|130.5px 130.5px|

判定は丸め前値を使用。after前景rgb(213,225,237)、最小比11.143813777552706、1440は11.274290398241694。実背景グラデーションを保持したまま説明文字だけ改善。比較table352pxと通常の局所overflow auto、global .twoの760px境界、保存比較の非正規化power/max（before同幅完全一致）を保護。skill-gridの既存色/黄色level block・シリーズ/グループ表現に変更なし。

stark作成ファイル: 新規tools/r250-stage6-ui-browser.test.cjs、UI_CHANGES.md、専有evidence/ui（proposal、before/after測定・log・画像）。stark製品直接編集0。himmelのみindexへCSS6規則を統合。DB/数値/verified保存仕様/Git変更なし。

未解決: この3件の限定再現条件では解消。iOS/Safari実機・全MHDB名称/全装備・実画像OCR・全ブラウザ検証は本担当単独では未実施。長名大量skillは表示stress fixtureなのでDB意味・発動判定の検証を意味しない。資料IDの折返しは切捨て/global hiddenを用いていない。比較診断操作の順序等は本範囲で変更なし。

統合提案: KAN16局所CSSと新規回帰・証跡は採用可。fern全Browser/独立レビュー結果を品質ゲートに併記し、未実機条件を保証に拡張しない。
