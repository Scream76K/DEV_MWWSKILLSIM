# Stage6 独立レビュー — eisen（アイゼン）

2026-10-11 / ORG-05 ARCH。指定cwd、codex/integrate-r249、HEAD fb6d82cd525da9273af10ac6b719f330208608c5を独立確認。製品/DB/tests/Git編集0、原本/GUILDアクセス0、再委任0。本報告のみ作成。

## 判定

局所CSSと根拠整理は統合可。ただしfern全回帰の最終結果を統合ゲートとして併記する。現時点の新UI26成功はstarkの実行証拠であり独立再実行件数ではない。本レビューで書込みを伴う撮影テストは再実行していない。

before922ファイルをSHA256で独立照合：欠落0、変更index.htmlのみ。tar内indexと現行の完全差分はhead末尾style追加のみ（diff上10追加行）。JS、DB、テンプレート、OCR、Stage4/5既存報告は不変。既存143もこの保全母集団に含まれ、許可index以外に変更なし。refsは読取HEAD/branch一致のみ独立確認、履歴操作なし。

index.html:318–327の局所規則は資料LI折返し、比較理由文字色、外側workspace縦積み、内部skill二列とmin-width/長名折返し。spec/01_DATA_AND_EQUIPMENT.md:9の内部ゲームblock二列を維持する。global overflow隠蔽や固定高さで切り捨てていない。外側全幅と内部二列を混同しない。

after-390-comparison.pngとafter-375-workspace.pngをview_imageで独立確認。比較理由が明るく読め、内部二列を保持。after測定の全5幅overflow0/contrast11以上は担当証跡に基づく。contrast試験は実gradient画像の背景サンプリングで、透明祖先を白として判定する誤りを避ける。ただし測定領域・fixtureに限り、全アプリのWCAG合格ではない。16skillはDOM表示stressで発動計算の検証ではない。

新Browser試験は資料展開、説明contrast、内部二列、外側幅、.two境界/比較局所scroll/保存比較/非正規化値を保護する。beforeとafter同幅のpower/max比較はCSSが数値を変えない確認として妥当。26は親1＋子25であり26独立シナリオではない。実MHDB全名称、Safari/iOS、全入力/アクセシビリティ、実画像OCRは未検証。

## 根拠整理と残事項

DPS_EVIDENCEと23行traceJSONは資料存在/related候補/exact同一性/対象版/正式検証を分離し、alias登録・数値昇格なし。14武器不足表と段階的GS/CB/IG計測案は全武器録画を先行要求せず妥当。537件のV/P/Uや旧URL発見から正式DPSを生成しない。正式DPS0/14の成立確認を更新する実機根拠はない。

SALADA_FOLLOWUPはweb/cua失敗を動画削除等へ読み替えず、フレーム/時刻/所有部位未確認を維持。raw211→実効321のコード適合と映像検証を区別。OCR_FOLLOWUPは実画像golden0/3、合成crop≠実detector、旧係数≠truthを維持。

P2文書locator：DPS_EVIDENCEのindex行番号はCSS統合前基準で10行ずれる。現行TECHNIQUE_DB_R47_EVIDENCE5107、TECHNIQUE_DB_EVIDENCE5199、HH source6585、chargeBladeComboDamage3845、techniqueDbHits5294。報告行を現行へ更新するか採取基準を明記することをhimmelへ連絡。製品統合を止める内容矛盾ではない。

traceJSONのindex exactMentionsを現行実文字列で照合すると84 locatorが不一致（CSS追加前の10行差）。追跡内容の反証ではなく基準版の記録不足として報告。本人/統合担当による基準明記または再採取が必要。

全Browser並列のpower-change-display width[0,0,0]失敗は主担当から受領、独立起動していない。既存tools/power-change-display-browser.test.cjs:5は直接innerHTML注入、:7はviewport変更直後にcount確認とrect取得し、祖先details展開・visible/layout待機を明示しない。今回CSSはtable/th/祖先detailsのdisplay/visibilityへ触れないため、コード読取だけでCSS退行とは断定できない。単体/直列再確認と失敗時visibility/open/rectの追加観察が必要。初回失敗を成功に置換しない。全QA判定はこの結果待ち。

回帰リスクはworkspace配置の全幅変更と!important局所色の将来競合。以後関連CSS変更はhimmel単独indexロックと5幅/資料展開/内部二列/長名/比較table回帰を維持。正式根拠未取得は機能完了へ昇格しない。

## 最終再確認・QA保留更新

frierenによるlocator更新後に再照合：trace23行のindex exactMentions不一致0。DPS_EVIDENCEの現行関数/registry行更新も読取確認し、前記P2 locator指摘は解消。新UIテストdefault phaseはafterへ変更され、通常再実行がbefore証跡を上書きしない。期待値変更はない。

fern結果の追加受領：Browser直列91成功/1失敗も同じ幅0、単体1成功。したがって並列限定とは断定できず、既存初期化/visibility/タイミングまたは製品条件依存の分類は未確定。失敗した現行と変更前indexの同条件比較、祖先details/open・computed display/visibility・rect証跡の限定切分け待ち。単体成功を全Browser成功へ置換しない。

現時点の最終統合判定はBrowser品質ゲート保留。局所CSSの仕様整合と保全確認は維持するが、全QA合格・退行なしとは宣言しない。根拠文書は統合可。製品追加変更は行っていない。

## 測定競合の原因確定・テスト補修レビュー

fernのtrace-live-current15回12成功/3失敗の提供証跡を読取。失敗時の旧locator幅0/isConnected=falseと同callback内の現行query幅112/120/120の対照は、resize再描画による切離されたDOM参照を測る競合を支持する。index.html:7342はresizeでrenderCachedBuildComparisonを呼ぶ既存経路。分類C（測定競合）として扱い、製品幅不正とは区別する。

himmelの既存power-change-display-browser.test.cjs:7変更を独立読取：connected/正幅のwaitForFunctionと、同callbackで現行query→rect取得へ置換。期待値112/120/120、他assertion、skip/削除は不変。waitだけに依存せずqueryと測定を同callbackへ集約する点が原因に対応しており妥当。タイムアウトは失敗のまま残り、実際の不正幅を期待値変更で隠していない。製品追加修正なし。単体反復と全Browserの再実行結果確定まで品質ゲート保留を維持。

## 最終品質ゲート

browser-fixed-parallel.logとbrowser-fixed-serial.logを独立読取：両方tests92/pass92/fail0/skip0。初回91/1と原因traceは保存し、再実行成功へ置換しない。対象単体10連続成功、Node752/DOM304/旧OCRTemplate17成功はhimmel提供結果として受領し、本レビューの独立再実行として加算しない。

最終before922 SHA再照合：missing0、変更index.htmlとtools/power-change-display-browser.test.cjsのみ。Stage4/5既存報告・DB・OCR不変。許可変更は局所CSSと原因特定済み測定競合補修。Browser品質ゲート保留は解消し、今回の変更/監査報告は統合可。ユーザー/ゼーリエの正式完了承認は別に待つ。commit/push/merge等の履歴操作・公開は実施しない。実機Safari、全MHDB長名/装備、実画像golden/正式DPS/映像所有権の未検証条件は引き続き維持する。
