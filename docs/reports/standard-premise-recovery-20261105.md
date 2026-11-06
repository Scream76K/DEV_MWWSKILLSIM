# 標準比較の条件producer接続（未完）

> 訂正：弓貫通の旧復元係数と910.95/1285.55の結果は無効。KAN-108 #11107/#11108の最新採用を見落としていた。末尾「貫通ビン係数の訂正」の最終版を参照。

## 今回直接確認したJira

KAN-108 / KAN-47 / KAN-55本文を再取得。DPS中止、通常/最大の独立、非正規化主表示、適正距離固定、保存A/Bと復元の契約を確認。

- [KAN-66 コメント11151](https://harasworkspace-36774503.atlassian.net/browse/KAN-66?focusedCommentId=11151) を原文で確認。旧3096b71とPR #1候補の13/13一致は、算出4・未算出9を含む退行比較。全13武器完成の証拠ではない。現行で改めて行った14代表ケースの明示条件付き成立、今回の未入力比較は別の実行とする。
- [KAN-47 コメント11117](https://harasworkspace-36774503.atlassian.net/browse/KAN-47?focusedCommentId=11117) を原文で確認。旧standardPowerForStats系のCB局所接続は抽出関数の隔離評価まで。今回以前の成果ではconsumerEvaluationPlan→evaluateConsumerCombat→共通adapterへ現在/保存を接続し、榴弾R/Hの公開操作を実行済み。ただし標準開始条件と強属性Hは未完のまま。
- KAN-66/47とも新しい順の100コメントを取得（total117/131）。上記IDは取得内で確認。古い全ページを網羅したとは扱わない。PR #1/#2の未統合候補を今回無断で取り込んでいない。

## 共通原因と修正

空の技列に対して基準技IDだけを生成し、条件は空の入力欄からコピーしていた。さらに後段で条件を解決しても、前段calcBuildで作った古いconditionalConditionPlanが残り、黒蝕や属性上限相互作用の照合が不整合になった。

index.htmlへconsumerStandardConditionsを追加。STANDARD時だけ、現在と保存A/Bで同じ条件生成を使用。DOM・保存データには書き込まず、明示した値と個別コンボは保持する。標準条件から既存standardPowerConditionPlanを再生成してadapterへ渡す。係数・ダメージ式は変更していない。

|項目|標準時の補完と根拠|
|---|---|
|条件付きスキル|通常は未発動基準、最大は既存採用効果の発動モデル。属性変換OFF/ON、狂竜症通常BEFORE（未発症）。既存の通常未発動/最大到達モデルへ接続する比較シナリオであり、ユーザーの実戦状態推定ではない。詳細入力がある場合は保持。|
|LS|既存profileCatalogのRED開始|
|DB|既存鬼人化乱舞標準の鬼人化・必要ゲージ成立。ゲージの数値量や時間は作らない。|
|SA|採用済み剣開始5Hit列・高出力追撃なし。明示の高出力状態は保持。|
|IG|既存三色基準・猟虫収納、本体のみの採用範囲|
|HH|既存自分強化→ジャスト重ね掛けの4技。HUNTING_HORN_EVIDENCEのUSER_CONFIRMED各技1回/合計4回の響玉を採用済みイベントモデルへ接続。自分強化初期0、攻撃旋律なし。新規係数なし。|
|GL|完成武器レコード（巨戟の既存砲撃上書き込み）のshell/shellLevelを既存DBマッピングへ。DBの基本装填数＋砲弾装填効果で満装填、杭装填済みの4技標準開始。火肉質は選択した訓練部位の実レコード。入力肉質や固定係数は捏造しない。未対応武器威力は既存ガードを保持。|
|遠距離|KAN-108の適正距離CRITICAL。弾・ビン種未選択を勝手に別の弾へ代替しない。|

初回実装のstructuredClone依存が旧JSDOM保存所有権テストで5件失敗。変更対象の条件オブジェクトを段階別コピーする実装へ修正し、18件すべて成功。テスト環境にpolyfillを入れて隠したものではない。

## 実行確認

`tools/standard-no-input-audit.cjs`：捕捉済みMHDBテンプレート、対象は訓練前面。武器・追加スキル条件を空欄、技未追加で計算→A保存→頭防具除去B保存→個別復元→比較。全14で単独/比較一致、復元一致、条件・保存不変。成功/保留を区別して出力。

10武器で通常/最大の双方が成立：GS、LS、SNS、DB、HAM、HH、LAN、GL、SA、IG。これは各代表装備/対象/採用範囲の確認であり全組合せではない。

|代表A|通常|最大|
|---|---:|---:|
|ハンマー|1020.10|1341.80|
|GL（属性激化の既存採用）|1750.941125|2756.76779375|
|太刀|591.44|946.82|
|狩猟笛|869.94376|1167.51176|

上記4武器は隔離Chromiumの新規ページで追加条件を触らず、テンプレート選択→計算→異装備保存A/B→比較を実行。例HAM B=987.83/1141.07、GL B=1750.941125/2615.89779375。保存領域/比較前状態不変。詳細欄の開閉保持も実確認。旧owner-ui-regressionの途中の武器未選択問題は未切り分けなので、そのスクリプト全体をPASSとは扱わない。新しい専用スクリプトは通常のテンプレート操作で確認する。

既存tools/stage4-cb-mix-public-proof.cjs成功。明示条件付きのR/H独立開始、丸め前合算、最大条件欠落時の通常保持、保存復元を維持。新しいCB標準開始の受入ではない。

証拠:
- ../evidence/standard-no-input-final.json
- ../evidence/standard-comparison-browser/result.json と各比較画像、equipment-390/1440.png
- ../evidence/standard-cb-preserved.json（共通条件接続後、後続HH/UI変更前）
- ../evidence/standard-ui-tests.txt（18件成功）

## 残る4武器とGL別問題

- CB：R/H標準開始を未接続。赤ゲージ5本と強化ビン内訳の既決適用範囲、H強化/強属性の契約が残る。H_NORMAL_PHIAL_ONLY/IMPACT_ONLYを消していない。PR #2盾突き限定承認をH全体へ流用しない。
- BOW：標準ビンの選択が未接続。既存NONE・POWER・CLOSE等の明示条件と、ユーザーの3ビン比較仕様を整合する必要がある。NONEを暗黙の完成基準にしない。
- LBG：代表巨戟ではARTIA_CAPACITY_AMMO_SCOPE_PENDING。通常弾速射参考成功を属性弾標準成功と扱わない。
- HBG：標準属性弾の種類・レベル・命中契約が未接続。既存参考の命中3を無条件転用しない。
- GL攻撃/会心激化のARTIA_COMPLETED_VALUES_UNRESOLVEDは別件として残る。今回成立は既存属性激化の適用範囲。

## 原画アイコン

親がユーザー原画として提供した `/tmp/icon-review.NfK8OZ/{head,chest,arms,waist,legs,charm}.png` をそのままassets/equipment-iconsへコピー。画像編集なし。provenance.jsonに原画SHA256。後段zeerie-owner-category-iconsの簡略SVG参照をPNGへ置換し、40×40、430px以下34×34へ統一。茶色背景・金枠を保持。MHDBロード後のChromiumで6画像decode・computed CSSのPNG参照・正方形を確認。390px画像を目視確認。

通常サマリ/比較は既にdetail:falseだったため追加の表示ロジック変更なし。今回実画面で属性名.element-labelが0、数値/アイコン/aria-label保持、詳細画面の属性名保持を確認。

Safari/iPhone/iPad実機受入、ゲーム内実測、最新API再取得は未実施。既存保存領域・DB・他worktree保護、commit/push/merge/公開なし。


## 追加調査 2026-11-05：残る4武器と巨戟GL

GL攻撃/会心激化を源資料に基づき修復。詳細・数値はgl-target-recovery-20261104.md末尾。最終HTML hash 7206bf6fc1467763eb0fe65735e49e3c36c79c306b166563059d83ceb3fd0144。隔離Chromium攻撃激化の実テンプレ操作→A保存→頭防具除去B保存→比較で通常/最大一致、属性文字非表示、6原画表示、390/1440pxの横あふれなしを確認。証拠 ../evidence/gl-attack-browser/result.json、gunlance.png（目視確認）。実Safari未確認。

残る4武器は本追加差分で完成していない。Jira Rovo検索に加えKAN-108本文を再読。弓は強撃/貫通/接撃の3種と適正距離固定が確定、既存標準BOW_EVIDENCE.coating.standard=nullをNONEへすり替えない。現在のBowReferenceは貫通非対応であり、producerを埋めるだけでは3種完了にならない。MAXAのHit構造を既存採用記録から取り出して現行共通経路へ適合させる必要がある。

GitHubのCB候補277f2211bae22326bddce9c59ce580d8e7bdd07e/hope-hammer-browser-adapter.js（220〜310行）を取得。POWER_ELEMENT H盾突き1爆発/0消費の2026-11-04承認を明示したローカル契約とガードを確認。候補はさらにH強化ストックを共有消費計画へ渡す変更を含むが、その変更は承認済み盾突きと同じではない。候補全体は取り込まず、R/H赤装填開始状態のproducer・強化係数/資源遷移の根拠照合が残る。SAED限定の3+2/5モデルをR/Hへ転用していない。既存明示CB R/H公開証拠は最終GL差分で再実行成功（../evidence/gl-mutations-cb-preserved.json）。

LBG/HBGの属性弾は、元武器のammoだけでは巨戟完成後の対応弾/装填数を表さない。memo38の同一属性素材数による属性弾追加と激化別装填変化を直接確認した。既存restorationはNORMAL_ONLYであり、属性弾の容量強化を接続せずそのガードだけを外すのは不可。採用済み接触回数と速射単位、完成武器の弾情報生成を合わせた修正が未実装。今回は新規のデフォルト弾/接触回数を推測していない。

追加のコード変更はGL完成メタデータ/Technique DB/対応resolverに限定し、保存/IndexedDBコードは変更なし。commit/push/公開なし。4武器を保留台帳へ移して完了とする報告ではなく、未完として継続対象に残す。


## CB・弓の標準開始接続（追加）

HTML SHA256 `248c8d2c72ffcf6215b89082d9b16785e687ea4b276b4db48f994da6cceb99be`。

CB: KAN-21の10055〜10059を直接再取得。赤ゲージ装填は5本、強化段階は別軸。標準シナリオは通常ビン5/強化0、盾・斧強化あり、剣強化なし。R=AXE/CHARGE、H=AXE/AXE_NEUTRALを別オブジェクトで生成し、前経路の終状態を流用しない。強化5へ読み替えず、明示された詳細条件は保持する。これは通常/最大とも同じ開始状態でスキルシナリオを独立評価する標準条件。consumerEvaluationPlanのevaluationState適用が解決済み状態を元の空条件で上書きしていた箇所も修正。

強属性H: PR #1候補277f2211bae22326bddce9c59ce580d8e7bdd07eの既承認盾突き1爆発/0消費だけ選択的に接続。H強化ストック拡張や別スキル変更は取り込まない。既存MHConversionComponentScopeの採用済み武器属性・強属性ビン範囲に、厳密H列/盾突き1爆発/消費0を照合して接続。係数追加なし。

弓: 旧作業 `2026-10-18/task/himmel-repair-diagnosis-11raqz6z/work` のindex.html/BowReferenceと採用資料を読取。MAXA=溜め3、貫通3+5+6矢各3Hit=42HitのPRODUCT_OWNER条件と技別属性係数をTechnique DBへ復元。物理/属性係数を計算器へ複写せずDB参照。現在のチャージマスター、連撃Hit加算、抜刀会心等の処理は保持し、Hit数取得を状態別に統一。42Hitの各矢分配は既存の計算前提であり独立実測済みとはしない。製品現行版の実測認定なし。

武器対応ビンが一意な場合だけ標準ビンを選択。巨戟は既読memo38の激化対応（攻撃=接撃、会心=強撃、属性=貫通）を採用。開始1射目、溜め3・適正距離。複数ビン対応通常武器で任意の1種を推測しない。属性変換の旧NONE限定照合は、より広い既承認MHConversionComponentScopeのBOW_THREEと新たに復元した技別元素係数を照合する経路へ拡張。物理ビン倍率を属性に乗じない。

|ケース|通常|最大|証拠|
|---|---:|---:|---|
|CB既存テンプレ榴弾|3432.0131|4357.1291|cb-standard-browser/result.json|
|CB実武器128 龍強属性|1709.602|2755.93|cb-standard-dragon-after.json|
|弓巨戟属性/貫通|910.9547577|1285.5504033|bow-standard-browser/result.json|
|弓巨戟攻撃/接撃|809.81429004|1148.4903966|bow-close-standard.json|
|弓巨戟会心/強撃|773.1102366|1107.3335106|bow-power-standard.json|

全ケースは異装備A/B保存・復元・比較/状態不変を確認。CBテンプレ/弓貫通は隔離Chromiumの通常操作で条件欄を入力せず確認、JS例外なし。既存明示CB R/H回帰も成功、UI保存所有権18件成功。Safari実機とゲーム内測定は未実施。証拠は../evidence配下。

正直に残す失敗: CB実武器103（水属性）＋属性変換装備は通常2006.832が成立するが最大が既存ATTRIBUTE_CONVERSION_BODY_SCOPE_UNSUPPORTEDで停止（cb-standard-element-first.json）。通常を隠さず保持。属性変換の非龍武器適用範囲は今回変更しない。CB全装備対応を完了とは扱わない。

LBG/HBGは未修正。HBG1094にはflaming Lv1/capacity2とdragon等がある。LBG1169のraw MHDBにはnormal/pierce/spread等のみで、完成巨戟の属性弾を生成する前提が未接続。属性弾を通常弾へ置換しない。属性弾の明示接触モデルは採用済みだが、標準命中列の本数をモデル配列の長さから勝手に決めない。LBGの対応属性弾速射を非速射と偽らない。残る共通作業は完成武器の弾メタデータ、標準命中列、速射単位の既存資料照合と接続。


## CB水属性と残るボウガン条件（後続）

CB103水属性＋属性変換の最大停止を修正。標準producerが武器属性に関係なく152最大ONを作っていたため、龍専用の採用効果を水武器へ要求していた。既存MHAttributeConversionRuleのDRAGON_WEAPON_BODY_ONLYと、CONVERSION_152_165_SCOPE_DECISION.md後続承認（非発動channel継続）に合わせ、標準条件だけ武器属性を見て生成。水など既知非龍はOFF、龍はON。未知属性を龍や0へ変換しない。手動条件のON/OFFは上書きしない。既存adapterの未採用範囲guard・固定追撃除外・他スキル計算を維持。

CB103標準A通常2006.832/最大2528.884、頭防具除去B最大2272.262。保存/復元/A-B比較一致と状態不変。手動ONを指定した反例は最大ATTRIBUTE_CONVERSION_BODY_SCOPE_UNSUPPORTEDを維持、通常は保持。CB128龍と弓龍貫通も最大値・保存比較を再確認（cb-water-standard-after、cb-water-explicit-on-retained、cb-dragon-eligibility-retained、bow-eligibility-retained.json）。この後続は隔離JSDOM、Safari/追加ブラウザー試験なし。

ボウガン調査: KAN-24全6コメントとKAN-23全36コメントを直接取得して属性弾/命中/速射関連を読取。KAN-24#10837は属性STANDARDが未採用だった履歴を明示。後続のr262-ig-scope-hbg-contacts/README.md、r262-contact-ui/README.md、baseline-target-signatures.jsonを照合した。最新基準のLBG/HBG欄も『目標Lv/命中数/属性を一意固定していない』と明記。1〜6は明示接触の受理範囲であり標準6命中の承認ではない。装填容量から命中数を生成しない規則も明示されている。

必要な未確定論点は、標準属性弾の1射あたり接触数、および複数対応属性弾がある武器の選択規則。この2点を資料から確定済みと主張できない。HBG1094は火炎Lv1/capacity2と滅龍等を持つ。LBG1169はraw ammoに属性弾がなく、巨戟素材/激化による完成属性弾生成と速射単位の追加実装が必要。memo38の装填数/属性弾速射可否は確認済みだが、対応弾Lvや1速射の計算単位まで同表から推測しない。既存LBG_ELEMENTは非速射明示範囲でrapid=falseを要求するため、属性速射を非速射として通さない。ボウガンは今回も未修正、未完。


## 貫通ビン係数の訂正

独立レビュー指摘後、KAN-108の全57コメントを取得し、#11107/11108原文を直接確認。2026-10-17の旧候補を最新仕様と照合せず復元したことが原因。前節の910.9547577/1285.5504033と係数297/12.852は正しい採用値ではなく撤回。42Hitという件数と動作成功だけでは係数仕様の一致を検証できていなかった。

最新採用は2026-11-03、出典https://www.sqexatkai.com/entry/2025/03/16/164427（2025-03-16記事）。物理Hit倍率[1,1.2,.9,.5]、基本MV5.5/5.5/6.6。属性は基礎.2に[1,1,.8,.4]。各矢3Hitのため第4Hitは使わず記録だけ保持。Technique DBのみを訂正し、計算器の係数複製・新規丸めは追加しない。現在ゲーム版実測済みとしない。

独立係数期待を先にテストへ追加し旧実装でFAILを確認。その後、9/15/18Hitの物理51.15/85.25/122.76、属性1.68/2.8/3.36、合計42Hit/259.16/7.84を確認。さらに攻撃100/属性100/肉質100/会心0で、適正距離物理1.1により物理285.076＋属性78.4＝363.476となる独立期待と各Hit trace合算を確認。小数をHit単位で丸めず合算していることを検査。

代表テンプレA通常757.232284156/最大1061.829573724。頭防具除去B通常695.59571712/最大964.9603498176。現在計算・保存・復元・比較が一致し状態不変。隔離Chromiumも同値。接撃809.81429004/1148.4903966、強撃773.1102366/1107.3335106は不変。Safari実機未確認。

証拠: ../evidence/bow-pierce-coeff-before.json（意図した旧係数失敗）、bow-pierce-coeff-final.json、bow-close-coeff-regression.json、bow-power-coeff-regression.json、bow-pierce-corrected-browser/result.json とbow.png。最終HTML SHA256 067053c256f72510623e6ef686bb1c287ba7570099f0f74a9da6306561324032。

ボウガンはKAN-108の関連コメント追加照合・Jira検索も実施したが、標準属性弾接触数を確定する新たな記録は得られなかった。baseline-target-signaturesの未固定記述とr262明示1〜6接触契約が最新の確認済み根拠。製品値を変更せず、親へ選択肢として「全ビルド共通の固定接触数を比較前提として新たに決める」か「既存の具体的な採用記録があるならその条件へ合わせる」を提示。対応属性弾が複数ある場合の選択も、固定優先順か選択対象肉質による自動選択かの比較ルール決定が必要。速射係数は設計選択で補えず、別途出典照合が必要。


## 属性弾1接触の共通比較基準（2026-11-05）

親の後続指示（開発側で標準前提を決める、1射1接触案）に基づく比較用の暫定前提。実射の全Hit数を1と認定したものではない。既存明示1〜6接触の計算を1接触で利用し、威力係数・速射係数を新規追加しない。

consumerElementAmmoChoiceは、非アーティアの公式MHDB対応属性弾（火炎/水冷/電撃/氷結Lv1/2）を取得。比較では選択された全武器に共通する属性弾・Lvを交差集合で求め、対象の属性肉質が高いものを採用。同肉質は火/水/雷/氷の固定順、同属性なら共通対応Lvの高いもの。滅龍は別計算を要するためこの既存4属性モデルへ混ぜない。単独は同じ規則をその武器に適用。アーティア完成属性弾を元DBから捏造しない。

標準は適正距離、1接触、現在対象部位、先頭1射、満装填開始、非特殊モード。LBGの速射状態は実ammo.rapidから取得し、trueをNORMALへ変換しない。双方の共通弾がない場合、単独計算は各対応弾で保持し、相対比較をCOMPARISON_ELEMENT_AMMO_MISMATCHで止める。手動の弾/命中条件を上書きしない。比較前のraw条件・保存データを改変せず、派生条件だけ行評価へ渡す。単独/比較画面に「1射につき接触1回」「多段命中を含む1射全体ではない」を表示。共通弾なしの行にはそれぞれの属性弾を表示する。

刃鱗増装は通常未発動・最大発動の既存シナリオへ渡す。最大が未採用なら保留し、最大をOFFへすり替えない。

確認（すべて捕捉済み実MHDB、隔離保存）：
- HBG467、追加条件なし。A19.9424、雷珠35追加B22.4024（通常/最大同値）。保存/復元/比較一致。隔離Chromiumでも操作・注記・画像確認成功。
- 非速射LBG766、A13.95968、同雷珠追加B16.13168（通常/最大同値）。公開計算/保存/復元/比較一致。
- HBG467電撃のみ vs1094火炎のみ：両方の単独計算を保持、相対だけ保留。状態/保存不変。
- 速射LBG768：公式flaming Lv2 rapid=trueを使い、NON_RAPID_CRITICAL_FIRST_HIT_REQUIREDを保持。偽の非速射成功なし。
- 既存HBGテンプレ1094：通常A30.3336/B28.01088は算出、最大はBLADESCALE_OFF_REQUIREDで未完。
- 既存巨戟LBGテンプレ：ARTIA_CAPACITY_AMMO_SCOPE_PENDINGで未完。完成属性弾・容量強化・速射モデルを接続したとは扱わない。
- UI/保存所有権18件と弓最新係数の保存比較を回帰確認。

証拠 ../evidence/hbg-one-contact-native-first.json、lbg-one-contact-native-first.json、bowgun-no-common-ammo-final.json、lbg-rapid-standard-pending.json、hbg-one-contact-template.json、lbg-one-contact-template.json、hbg-standard-one-contact-browser/result.json とheavy-bowgun.png、bowgun-standard-state-tests.txt。

最終HTML e5c74f49456b3f509a72d506bbcd4f0a835fb963cfc3dc8297c8668133871298。ブラウザー実行は注記文言の最終補足前4aa08260...（計算差分なし）、共通弾なし注記の最終補足後はJSDOM再実行。Safari/ゲーム内実測なし。計算adapter/式/キャッシュ変更なし、commit/pushなし。

## 接触数表示の独立レビュー修正（2026-11-05）

- 原因: `fill` は指定済み3接触を正しく保持するが、evaluationPlan.standardAmmo に選択候補の contactCount=1 をそのまま記録し、注記も1回を固定出力していた。計算自体は3接触。
- 修正: `consumerAppliedAmmoPremise` が適用後の弾種・Lv・contactPolicy・contactCount・距離・射撃方式を取得。FIRST_HIT は1、EXPLICIT_CONTACTS は実際の指定数（個別contacts経路は配列長）、未確定は未確定と表示する。標準の弾選択は「暫定」、既定接触数は「標準値・暫定」、明示接触数は「指定値」。完全明示入力にも適用条件を表示する。
- 相対比較は実条件を照合し、標準/明示という由来だけの違いでは拒否しない。接触数違いは拒否を維持。計算式・MHDB・IndexedDB・保存形式は変更なし。
- 最小再現: HBG467、電撃Lv1、指定3接触、Bのみ雷珠35。修正前は A58.79296/B66.17296 なのに metadata=1、テスト失敗。修正後は同値のまま metadata=3、表示3回。現在→保存→復元→比較の値と状態保持を確認。
- 証拠: worktree外 `../evidence/ammo-premise-before.json`（期待する失敗）、`ammo-premise-three-after.json`、`ammo-premise-explicit-three.json`、`ammo-premise-standard-one.json`、`ammo-premise-different-elements.json`。最後のケースは467/1094の通常実値を独立表示し異属性の相対比較を保留、1094最大の刃鱗未対応も正しく保持。
- `node --test tests/ui-build-workflow-contract.test.cjs` 13 PASS。隔離Chromium `../evidence/ammo-premise-browser/result.json` と `heavy-bowgun.png`: 標準1接触A19.9424/B22.4024、通常最大/保存比較一致、暫定注記を目視確認。3接触はJSDOM確認、Safari実機未確認。
- 製品 index SHA256: `802c065559c8d189308627f3e4ab970872d20eaf46a0c6150ad72d6bf2e259ff`。

## HBG160 / 巨戟LBG の継続調査（同日、未接続）

- Jira KAN-24 全6コメントを再読。10837は属性弾の採用範囲未確定、10097は適正距離固定、10095は非速射通常弾だけの承認。通常弾承認を属性速射へ移す根拠ではない。
- 刃鱗: https://kuroyonhon.com/mhwilds/program/skill.php は「特定の弾」、3回分、ボウガン1.4、First Shot初撃のみ。公開シミュレータ https://kuroyonhon.com/mhwilds/d/dame.php のUIは「ボウガン物理1.4倍」と明記。属性弾が対象になるかの明示根拠は今回取得範囲で未確認。通常/散弾の実測を属性弾へ拡張せず、現行ガードを維持。公式版での属性弾ON/OFF実測も未取得。
- 属性速射: https://kuroyonhon.com/mhwilds/memo/14.php は火水雷氷Lv1/2について2発、それぞれ物理0.6・属性0.6を記載。チェイスは別構成。これは通常弾速射からの流用ではないが、現行ゲーム版の実測確認ではない。射撃/接触単位、First/Force Shot、速射強化、装填の統合検証前であり、製品へ未投入。
- 巨戟: https://kuroyonhon.com/mhwilds/memo/38.php で完成弾のパーツ数別容量と激化による差を確認済みだが、今回読取の表に属性弾Lvがなく、raw MHDB1169にも完成属性弾行なし。別実測系資料のLv2記録は見つかったものの、パーツ数/強化状態/版が一致する根拠照合は未完了。完成属性弾と容量強化を架空のMHDB行として追加しない。
- ネットワーク制限下のcurlは名前解決失敗後、読取限定の承認を得て公開HTML取得に成功。権限拒否による停止ではない。未完了の原因は適用範囲・完成データの根拠照合不足。

## HBG刃鱗増装の適用対象を暫定接続（追加調査）

既存のBOW_R115_BLADESCALE_COATING_SOURCEで採用済みの一次実測資料 https://bozumemo.jp/monster-hunter-wilds/mhws-skill11/ を本文再確認。2025-06-30公開/07-02更新、Ver1.020。LBGおよびHBG欄は対象を通常弾・散弾・貫通弾と列挙。HBGはサイドアルシャマリⅠで計測。これを根拠に火水雷氷属性弾を刃鱗特殊弾/倍率の対象外とする SOURCE_BACKED_PROVISIONAL をTechnique DB属性弾レコードへ登録した。1.042.00.02の実測済みとはしない。

adapterはID160/Lv1/重複の妥当性検証を保持し、DBの対象外弾に限り通常・最大の計算を継続。物理1.4を属性弾へ転用しない。診断にはINELIGIBLE_AMMO_PROVISIONAL、要求発動状態、物理/属性各倍率1、magazineEffect NONE、出典版1.020、現行版PENDINGを保持。根拠ルールのないON/未指定はBLADESCALE_APPLICABILITY_UNRESOLVEDで停止する。

検証（実MHDB取得済みfixture、通常UI入口）:
- 修正前 `../evidence/hbg-bladescale-eligibility-before.json`: 元HBG1094テンプレート最大がBLADESCALE_OFF_REQUIREDでテスト失敗。
- 修正後 `hbg-bladescale-eligibility-after.json`: A通常30.3336/最大38.114736、頭装備解除B通常28.01088/最大35.546128。現在・保存復元・A/B比較一致、状態保持。診断の対象外・倍率1・版1.020もassert。
- `hbg-bladescale-explicit-off.json`: 明示OFFでも全値一致（対象外のため発動ON/OFFで値を変えない）。
- `hbg-bladescale-different-ammo.json`: HBG467/1094の異属性比較は独立実値保持、相対比較保留。
- `hbg-bladescale-lbg-nonrapid-regression.json`: 非速射LBG766 A/B維持。
- UI契約13 PASS。`hbg-bladescale-browser/result.json`、heavy-bowgun.pngは隔離Chromiumで元HBGテンプレート通常/最大・保存比較成立、pageerrorなし。Safari実機未確認。
- 歴史的OFF限定検証 `tools/stage4-hbg-element-display-proof.cjs` は旧未対応ガードを期待するため、この拡張の受入根拠には使っていない。

## 巨戟LBGの弾Lvについて追加で判明した点

一次資料 https://bozumemo.jp/monster-hunter-wilds/mhws-artian-weapon/ （2025-03-05公開/03-16更新）は、火水雷氷同属性3パーツでLv1属性弾4発・速射対応と明示。https://bozumemo.jp/monster-hunter-wilds/mhws-osusume-lbg/ は属性弾強化火薬でLvを上げると説明。したがってビルド記事の「Lv2」を無条件の完成武器ベース値に流用してはいけない。前節の『Lv未判明』はこの調査で解消したが、巨戟移行後の版適合は資料間照合の暫定扱いが必要。

残実装は、(1)選択パーツ/属性/激化から元弾Lv1と容量を構成し元MHDBと区別した根拠付き入力を作る、(2)属性火薬の実入力に従ってLvを変える、(3)復元容量と追加弾倉を独立加算し保存比較でも同じ完成状態を復元、(4)属性速射専用2発×0.6モデルをFirst/Force/速射強化と射撃単位に整合させる、の接続。これらはまだ実装しておらず、LBG1169の未算出が解消したとは報告しない。通常弾速射係数の流用なし。

## 巨戟LBGの完成属性弾・復元容量・属性速射を暫定接続

`gogmaLbgElementAmmo` を純粋な完成弾生成として追加。MHDBの武器行/弾行は変更せず、別の completionEvidence を付けた入力を生成する。火水雷氷、同属性2/3パーツのみ。基礎Lv1、容量3/4（ボーメモ2025-03）、巨戟属性激化+1（kuroyonhon memo38・版未記載）。通常/EXの復元容量は既承認ルール+1/+2を一度だけ加算。元1169テンプレートは雷3パーツ・攻撃激化・復元+4なので電撃Lv1/容量8。龍/状態異常/未知パーツは補完しない。

詳細欄へ「巨戟LBG：属性弾強化火薬」を追加。未指定の標準はなし、明示装備でLv+1。既存combo状態として保存/復元。通常弾火薬との同時指定はPOWDER_SLOT_CONFLICTで停止。特殊弾専用追加弾倉は属性容量へ足さず、速射専用追加弾倉の新規モデルは未導入。標準は追加弾倉なし。現在/保存比較とも同一の完成入力を使用する。

属性速射はTechnique DBに独立ruleを登録（通常弾速射から流用しない）。https://kuroyonhon.com/mhwilds/memo/14.php の火水雷氷Lv1/2速射行から2発・各物理0.6/属性0.6、skill.phpから速射強化Lv1の物理/属性1.05。sourceVersion=null（現行版実測未確認）、SOURCE_BACKED_PROVISIONAL。`bowgun-element-reference.js` は各弾の接触列を独立計算し、丸め前に2発分を単純加算。平坦属性加算は従来採用式の各接触分を維持。弾消費・ゲージ回復・チェイス・DPSはモデル化しない。標準は適正距離・満装填・射順1・速射可能・各弾1接触。画面は「速射1回（2発）、各弾接触1回（標準値・暫定）」と表示し、2発を1Hitと混同しない。

First/Force Shot併用は射撃単位への適用根拠の追加照合が必要で `LBG_ELEMENT:RAPID_SHOT_SKILL_SCOPE_PENDING` を維持。元1169テンプレートにこの併用はない。native速射でも武器の実rapid属性・開始状態を検証し、不一致は停止。非速射の既存経路を維持。

実行証拠（worktree外 `../evidence/`）:
- `lbg-gogma-rapid-final.json`: 元1169、A通常42.648905376/最大52.554604032、頭装備解除B通常41.113802016/最大49.929711552。現在/保存/復元/比較一致、状態保持。
- `lbg-gogma-element-powder.json`: 火薬装備Lv2、容量8維持。A53.31113172/65.69325504、B51.39225252/62.41213944。保存復元・比較一致。
- 両ケースで元MHDB無変更、容量の再呼出し二重加算なし、未知属性/パーツ拒否、実装飾品358のFirst Shot併用保留、火薬枠競合をassert。
- 独立計算oracle: 攻撃100/会心0/肉質各100/Lv1、速射2発の物理9.6・属性24・合計33.6。平坦属性40と速射強化を併用すると43.68。通常弾係数非依存。
- `lbg-native-rapid-stage.json`: 生産768の速射実装備も算出。`lbg-nonrapid-final.json`: 生産766の既存非速射維持。
- `lbg-connection-hbg-regression.json`: 前ターンHBG修正維持。
- `lbg-connection-14-cases.json`: 最終HTMLで14武器各1テンプレートの通常/最大、保存A/B、復元、状態保持を確認。全構成や実機での14武器受入を意味しない。
- `lbg-gogma-rapid-browser-final/result.json` と light-bowgun.png: 最終hashの隔離Chromiumで通常/最大A/B一致、暫定・2発/各弾1接触の注記を目視確認、pageerrorなし。Safari/iPhone実機未検証。
- UI契約13 PASS。adapter/referenceの構文確認成功。

最終SHA256:
- index.html `f8b88932b7de271dc402454f8b50e0e5a8c31698d27f0f245d59b39b759821c1`
- hope-hammer-browser-adapter.js `0b3d356fb1e0b52bfde0145c1bfa3a65c05ccd1da5a65884f787741c2d4eec68`
- bowgun-element-reference.js `d53c2027766cb9ee86dd9f57bb68bbc59172912d319d4f8870432f97df6526f4`

commit/push/merge/公開なし。キャッシュ/IndexedDB保存コード変更なし。

## First/Force Shot・速射弾倉・状態異常由来弾の限定接続／保存パーツ比較修正

変更前の3製品ファイルとhashを `../evidence/lbg-shot-extension-before/` に保全（index f8b88932…）。今回の調査でKAN-23コメントも検索したが、属性速射のFirst/Force数値を承認する記録は確認できなかった。MHDB1169（gameId86）の武器/弾行・装飾品358（First Shot140 Lv1）、12（Force Shot145相当の実レコード）を照合。MHDBには完成パーツ別弾容量表はないため、以下は別の出典付き暫定ルールである。

- https://kuroyonhon.com/mhwilds/memo/14.php は速射1回の消費弾数1、属性速射2発、追加弾倉+1は速射モード移行後リロードで有効と明記。既存skill.phpの射順スキルルールと合わせ、1回の速射を1射順として2発に共通適用する SOURCE_BACKED_PROVISIONAL を記録。ゲーム内実測による確定ではない。First物理攻撃+5/10/15・属性1.1、Force4/6射目の物理攻撃+3/6/10・属性1.05、4射目以降会心+8/10/12を既存DBから使用。攻撃加算は属性攻撃力へ混入させない。射順1～容量・満装填開始・速射可能が必要。
- 巨戟LBGの速射専用追加弾倉を詳細欄に追加。標準なし、明示装備時は速射モードで満装填済みという入力を要求。capacityは元/復元8に+1=9。特殊弾専用追加弾倉との同枠競合は停止。通常射撃や非満装填への自動加算はしない。
- 毒→水冷、麻痺→電撃、睡眠→氷結、爆破→火炎はbozumemo artian-weaponとmemo38に一致する属性弾部分だけ登録。2/3素材で容量2/3、巨戟変異と復元を別加算。状態異常ダメージ自体は未導入。
- 毒素材の実操作・保存比較で、normalizeCharmが画面で許可する状態異常素材をfireへ戻していた既存不具合を再現。正規化の許可リストをUIの9種類へ整合し保存/復元で保持。無効な未知値は従来どおり拒否/正規化される。
- 龍素材/滅龍弾は未接続。memo14内に「速射補正表1→1」と「MV行の2発」の食い違いがある。通常4属性の2発×0.6を流用せず、龍素材から火炎弾への暗黙置換もしない。

独立レビューの保存装備差欠落も修正。火薬・弾倉はコンボ条件オブジェクト内に保存されているが装備パーツであり、共通条件とは別。compareSnapshotでは保存されたelementPowder/normalPowder/specialMagazine/rapidMagazineを各ビルドから読み、完成武器入力まで引数で伝播。共有対応弾選択も各保存火薬を参照。旧保存の新規パーツ欠損は標準なしとして扱い、現在の編集画面の装備を流用しない。射撃順/接触数等の共通比較条件は維持。

検証証拠（../evidence/）:
- lbg-extension-first-magazine.json: FirstLv1＋追加弾倉、A44.435596464/53.622919728、B43.251317424/51.602645808。容量9、+1一回、保存/復元/比較一致。
- lbg-extension-force-four.json: ForceLv3・4射目、A44.626633128/53.826221736、B43.419774888/51.772079016。同じ保存確認。別oracleで1/4/5/6射目の攻撃/会心/属性適用を独立assert。
- lbg-extension-poison-water-final.json: 毒素材→水冷Lv1/容量7、保存復元と比較一致。変更前は比較のSHOT_MODE_WEAPON_MISMATCHを再現。状態異常素材を保存後も維持。
- lbg-extension-saved-powder-ab.json: A火薬なしLv1=42.648905376/52.554604032、B火薬ありLv2=51.39225252/62.41213944。比較の実値はそれぞれ保持、弾Lv違いの相対指数は保留。
- lbg-extension-saved-magazine-ab.json: A弾倉なし/Bありの比較診断がそれぞれ追加なし/+1容量9、現在の編集画面からAへ漏れない。
- 非満装填、火薬枠競合、未知素材/パーツは失敗を確認。lbg-extension-14-cases-final.jsonは最終HTMLで14武器各1代表の通常/最大・保存A/B・状態保持を確認。UI契約13 PASS。
- lbg-extension-browser-final/result.json は最終hashの隔離ChromiumでFirst/追加弾倉付きLBGの現在/保存比較一致、pageerrorなし。先行browser実行は折り畳まれた入力のselectOptionがタイムアウトした（製品計算失敗ではない）。隔離の入力準備を明示代入に切替え、計算・保存・比較はボタン操作で再実行。Safari実機は未確認。

最終hash: index `3df1013f5f3d6197b126fef1c9c43c42561abd649e40b56f6d2bcdb7c3d258c3`、adapter `6a36fe73cb8792fa2958e107f9ae372e260d923c20dd7c3f38bf868b7a881024`、element-reference `d53c2027766cb9ee86dd9f57bb68bbc59172912d319d4f8870432f97df6526f4`（前回から不変）。commit/push/公開なし。
