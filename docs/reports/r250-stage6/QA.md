# Stage6 QA — fern（フェルン）

対象 `/Users/scream/Projects/DEV_MWWSKILLSIM-r250`、branch `codex/integrate-r249`、HEAD `fb6d82cd525da9273af10ac6b719f330208608c5` 一致。2026-10-11 JST。製品/DB/既存tests編集0、Git変更操作0、原本/GUILDアクセス0、再委任0。許可された本報告とevidence/qaを作成。実行は指定絶対Node24 runtime、Chromiumは承認されたsandbox escalation。

## 判定

Node752、DOM304、旧OCR/Template17成功。初回Browser幅0をC（test測定のresize再描画競合）と証拠付き分類し、himmelが測定1箇所だけ補修。補修後単体10/10、Browser並列92/92・直列92/92成功、skip0/exit0。**実行したStage6回帰品質ゲートは通過**。以下に初回失敗と切分けを保持し、最終成功で上書き隠蔽しない。実機/全機能の包括品質承認ではない。

## 今回の新実行（初回・修正前）

|実行|成功/失敗|skip|exit|
|---|---:|---:|---:|
|Node tests/*.test.cjs|752/0|0|0|
|DOM tools/*dom.test.cjs|304/0|0|0|
|旧OCR11ファイル + Template6|17/0|0|0|
|Browser全体 + smoke、既定並列|91/1（総92）|0|1|
|power-change-display単体|1/0|0|0|
|Browser全体 + smoke、concurrency1|91/1（総92）|0|1|

Stage5基準752/304/17と一致。Browserの総92は旧50＋新UI26＋smoke16、親試験を含む。再実行・単体・新UI部分集合を合算しない。全Browserは双方UI_PHASE=afterを明示しbefore出力先へ書かない。新testはhimmelによるdefault after変更後hashを記録した。新UIは両全実行で26件成功。独立実行ログは本フォルダevidence/qa参照、cancelled/todoも各0。

## Browser残存失敗

`mobile comparison shows baseline damage and weighted component changes and updates selected baseline` がthead実幅[0,0,0]、期待[112,120,120]で失敗。並列・直列の両全体実行で発生し、単体は成功。以前のTask Dでは未再現だった既存事象。今回再現したため隠さず記録する。並列依存と断定せず、当初D判定不能としたが、下記追加traceによりC（test測定の再描画競合）と根拠付き分類。期待値変更、検査削除、skip、任意sleep追加は行っていない。可視状態・描画境界・全体実行時条件を別切分けで確認する必要がある。当初優先度P1（回帰ゲート未通過）。現在は下記の根拠付きtest補修後に通過。

## 保全と変更範囲

Stage6開始manifest922ファイルをSHA256再計算。欠落0。初回はindex.htmlのみ変更、最終は許可されたindex.htmlとtools/power-change-display-browser.test.cjsの2件のみ変更。before tarとのindex差分はstyleブロックの局所追加10行、6CSS規則であり、script/DB/数値/OCR/template変更なし。初回の既存test全hash一致を確認。最終は許可されたpower-change-display1件のみ測定処理差分、他既存test全hash一致。新testはtools/r250-stage6-ui-browser.test.cjsのみ。既存143保全対象を含む開始ファイルは許可された2件以外不変（この段階の基準で照合、Stage2で許可変更された旧OCRを以前版へ戻す意味ではない）。HEAD/main/develop/origin/main/origin/develop refs不変、originへの取得/変更なし。追加文書・証跡は旧922の変更とは区別。

独立証跡 [evidence/qa/audit.json](evidence/qa/audit.json)。新test SHA256: `b4b24e8a49c670cad82fb98dadc8d7eaf0a1fe348ad4a26a755bcd623320feab`。

## UI改善証跡の照合

新UI実測5幅375/390/768/1024/1440でpage overflow全0。コントラスト最小11.143813777552706、1440は11.274290398241694、各16skill・内部2列を維持。before/afterの同幅raw comparison report完全一致。長identifier折り返し、保留説明文字色、装備/スキルworkspace列幅の局所CSS改善として整合。新UI26は子25＋親1。after証跡更新を実行、before証跡はUI_PHASE契約で保護。今回画像の独立目視QAは未実施、stark視覚監査と実測回帰を区別。

実MHDB全装備、実画像OCRの検出/認識精度、iOS/Safari実機、全武器正式DPS、公開環境E2Eは今回未実施。短名合成装備・長名合成skill stressはDBや発動正当性を証明せずVERIFIEDへ昇格しない。正式DPS0/14、OCR黄金0/3というStage5制約をこのCSS成功で解除しない。

## 影響・統合可否

himmelへ両全体Browser失敗を通知済み。starkの局所UI改善/26回帰は成功、eisen/fernは幅0条件の切分けが必要。今回証跡・報告と局所CSS・根拠付きtest補修は統合可能。対象回帰は最終成功、実機/未実施範囲の包括品質承認は行わない。commit/push/PR/merge等は実施していない。

## 追加切分け追補 — C測定の再描画競合

専有QAフォルダへbefore tarのindex.htmlだけを抽出（baseline-index.html）。既存test sourceはModule._compileでメモリ内instrumentationを追加し、baseline条件ではfs.readFileSyncのindex読取だけを差し替えた。worktree製品/既存test編集なし。trace単体baseline10成功/0失敗、current9成功/1失敗。関連比較/power群は18中17成功/1失敗（失敗は通常test、instrumented test成功）。これら調査実行は正式スイート件数へ加算しない。

さらにcurrent15回は12成功/3失敗。3失敗すべて同一evaluate callbackで、locator取得THの幅[0,0,0]・isConnected=false、現行document.querySelectorAll取得THの幅[112,120,120]。readyState completeで、切断済みTH→TABLE→wrapperにdisplay/visibility値がない。閉じたdetailsや非表示を原因とする証拠ではない。resize listenerはrenderCachedBuildComparisonでcompareOut.innerHTMLを再生成し、locator解決とevaluateAllの間に旧table参照が切断される測定境界を確認した。

C（測定のresize再描画競合）への根拠付き分類。最小案はp.evaluateの同一JSターン内で現行DOM queryとrect測定を行うこと。必要なcondition waitには既存Playwright waitForFunctionを用い、任意sleepや期待幅変更は不要。Node標準assertにpoll機能はなく、playwright単体をexpect.poll依存へ変更する必要はない。製品修正は追加不要。実装はhimmelのみ、QAは提案・traceまで。この追補時点では修正後全Browser再実行は未実施のため品質ゲート保留を維持。

trace証跡: visibility-trace.cjs、trace-baseline-repeated.log、trace-current-repeated.log、trace-related-current.log、trace-live-current.log。

## 測定補修後の最終結果

himmelのみ既存power-change-displayの幅測定1箇所を変更。Playwright waitForFunctionで現行TH3件・connected・正幅を待ち、p.evaluate同一ターンのdocument.querySelectorAll取得＋rect測定へ変更。期待[112,120,120]・他算術検査は不変。test1→1、assert16→16、削除/skip/数値期待緩和0。製品追加変更0。

|修正後実行|成功/失敗|skip|exit|
|---|---:|---:|---:|
|対象単体10反復|10/0（各1件）|0|各0|
|全Browser+smoke並列|92/0|0|0|
|全Browser+smoke直列|92/0|0|0|

新実行ログ: power-change-fixed-repeated.log、browser-fixed-parallel.log、browser-fixed-serial.log。初回91/1ログ・単体trace・baseline比較を保持。反復/直列/並列を累積成功件数にしない。UI_PHASE=afterを全体両再実行で明示し、before証跡を出力先に用いていない。新UI26は92の部分集合。after測定でraw reportはbefore同幅一致を維持。

最終922hashは欠落0、変更2件のみ。refs不変。測定補修test SHA256 `e488cbdf8d635bbc7430659287316df2790a9fde779beff03de4d3d723585102`。製品/CSS側は初回成功Node/DOMから追加変更なしのためNode/DOM再実行の反復は不要。実MHDB、実画像、iOS/Safari実機、動画確認の不足は最終成功でも解除しない。
