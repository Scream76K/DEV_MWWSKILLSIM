# KAN19/20 先行独立レビュー — eisen（アイゼン）

2026-10-11 JST。対象 `/Users/scream/Projects/DEV_MWWSKILLSIM-r250`、branch `codex/integrate-r249`、HEAD `fb6d82cd525da9273af10ac6b719f330208608c5` 一致確認。対象指定受領後はr250のみを明示workdirで操作。製品・DB・tests・Git変更なし。本REVIEW.mdだけ承認された単独write権限で作成。index統合中につき完成判定はしない。

## 正規入力の契約

element-state.js / element-display.js と DATA.md / CALC.md / CALC_PLAN.md / UI.md を照合した。Artia基礎属性欠損はnull/UNKNOWN、テンプレ選択型は値の証拠にしない。明示0はKNOWNとして属性skill対象、通常の明示specials空配列はCONFIRMED_NONE。raw-onlyの単位換算を捏造しない。既知状態異常4種は表示蓄積値を保持しhpElementのみ0、通常属性skillを適用しない。有効な選択型とレコードの不一致はUNKNOWNとなる。正規入力範囲でP0/P1は未検出。

独立の新規実行: bundled Nodeでkan19契約のみをname-pattern選択して10/10成功、kan20表示moduleテスト18/18成功、両exit0。統合中indexに依存するkan19 ingest/calc/comparisonテストは本実行対象外。全suite成功や製品修正完了を意味しない。

## P2: legacy・破損入力を確定へ昇格する境界

以下はメモリ内module probeで再現。正規MHDB schemaでは生じない入力だが、破損legacyデータまで安全と主張しない。

1. `fromRecord({specials:[]},{type:'stun'})` は非対応の明示選択を空選択へ正規化し、CONFIRMED_NONE/0になる。明示された不明型と選択無しの区別が失われる。
2. `fromRecord({specials:[],elements:{type:'dragon',value:100}})` は非配列elementsを不在と同じ扱いにしてCONFIRMED_NONE/0になる。DATA担当も同境界を記録済み。契約の「矛盾するelements無し」は正規配列に限定される。
3. `fromRecord({specials:[{kind:'status',status:'fire',damage:{display:100}}]})` はKNOWN/fire/100、hpElement=100になる。kind/statusのtag unionが矛盾しても型カテゴリを照合していない。逆のelement/poisonも受理される。legacy adapterが入力を検証するか、このmoduleでUNKNOWNへ留める場合に解消できる。

これらは新ゲーム数値の採用を求める指摘ではない。入力正常性の契約を明示し、必要ならunknownへ保留する指摘である。修正判断はroot担当へ共有済み。

## 表示・SVG

9SVGは独立vectorパスで構成され、script/image/外部hrefを持たない。18/22/24pxの一覧PNGを実視認し、炎/滴/稲妻/結晶/龍印/泡/chevron/ZZ/爆発の形状差を確認した。親aria-labelが日本語名・値・理由を持ち、未知型をasset pathへ挿入しない。色のみへの依存は避けられている。

UI.mdの独自制作・参考画像に基づく説明と現SVGの構造に矛盾は見つからない。ただし独立レビューでは参考画像との一致・全素材来歴の認証はしていない。ゲーム素材の完全再現verifiedとは扱わない。全製品5幅Browser確認は後続統合QAへ残す。

## 最終統合レビューへの確認事項

unknown/null/reasonがsummary・比較・JSON・AIへ維持されること、type mismatchで値を転用しないこと、状態異常蓄積値をHP属性damageへ流さないこと、legacy有限入力の互換経路が明示unknownを打ち消さないことを最終indexで確認する。元の丸め・ダメージ式・DB値や既存正値fixtureを変える必要はない。現時点はmodule先行レビューであり、統合全体の完成判定は保留。

## 最終統合独立レビュー（初回）

index統合後にkan19-element-state / kan20-element-display / kan20-element-comparisonの3ファイルを新規実行し39/39成功、exit0を独立確認。最初の3破損境界は入力形状・選択型・tagカテゴリの検証でUNKNOWNへ修正され、回帰も成功。unknown属性の実calcBuild・保存比較JSON・AI、既知状態異常のdamageForStats HP寄与0、比較module型不一致、SVG安全性を確認。9SVGは先行目視確認済み。

before-worktree.tar.gzをメモリ内展開してindex比較。TECHNIQUE_DBで始まるconst宣言21個は全literal一致、BUILD_TEMPLATE_DB literalも一致。Technique DBの数値変更を認めない。元式・丸めを修正する指摘ではない。

P0/P1は上位UI/保存比較の正規経路で最小再現無し。以下P2を公開直接入口・報告の追加境界としてrootへ共有。各probeはメモリ内実行、製品/テスト変更無し。

- genericStatsFromCalcState({attackTrue:200,affinity:0,maxAffinity:0},{hz:60,ehz:20,sharp:1.32,esharp:1.15}) は属性field未提供をdisplayedElement0へ補完する。bonusDamagePendingReasonはexplicit null/unknownを拒否するがundefined欠損を拒否しない。旧「有限数値入力」の互換とfield未提供を区別できていない。
- damageFromParams({attack:0,affinity:0,element:180,elementType:'poison',elementKnown:true,typeKnown:true,elementStatus:'KNOWN',mv:100,hz:60,ehz:100,sharp:1,esharp:1}) はe18/total18。上位damageForStatsでは0にしているが、公開params入口では状態異常をHP属性へ変換する。明示legacy数値の互換を保ち、statusタグ付き入力のみHP0へ分離可能。
- CHARGE_BLADE_FORMULAS.POWER_ELEMENT_PHIAL.evaluate({displayedElement:null,coefficient:1,elementalHitzone:100}) は0。Number(null)検証が欠損を有効0にしている。上位resolverは拒否済みだがlower直接契約は未保護。
- comparisonPowerChangeは異なる属性型でもcomponentChangePercent.elementを生成する。fire基準normal{comparisonPower:100,physical:80,element:20,special:0}→dragon候補{comparisonPower:110,physical:80,element:30,special:0}でelement50%。MHBuildRelativeComparisonのelemental比率拒否とは別のJSON報告経路。属性型違いで属性成分比率を禁止する契約ならここもnullへ。全体分母のcomponentContributionPercentは別仕様として判断。

これらは39件GREENで覆われない追加境界。最終完成判定は上記対応判断およびroot全QA結果後。全QAは本担当が未実行、tmp検証担当の結果を混同しない。

## 追加修正再レビュー（42件時点）

関連3ファイルを再実行し42/42成功、exit0。旧probeのgeneric属性field欠損とCB属性phial nullはELEMENT_VALUE_MISSINGへ、typed poison直接paramsはp/e/totalすべて0へ変更を独立確認。型不一致属性の変化率・寄与率はnullおよび理由へ変更され、新回帰も成功。before archiveとTECHNIQUE_DB const21個は引き続き全literal一致。CHARGE_BLADE_FORMULASブロックは入力guard/status処理が変わっているため「全formula source不変」ではなく「DB数値定数不変、入口guard変更」と区分する。

**P1 新規回帰: 手動ダメージ入力入口が数値文字列を拒否。** 実index JSDOM setupで `$('dElem').value='100';damage()` を実行するとELEMENT_VALUE_MISSING。damage()はelementにDOM.valueのstringを渡し続けるが、damageFromParams先頭がNumber.isFinite(params.element)に変わったため、有効な手動数値入力すべてを拒否する。これは単なる旧fixture初期化問題ではなく製品DOM入口の不一致。damage()側でblank/nullを拒否してから明示parseする、または公開paramsで非blank数値文字列だけを許可しunknownタグを優先拒否する修正を提案。元の数値式・丸め変更は不要。rootへ最小再現を共有済み。42件GREENのみで完了判定はできない。

## 手入力P1修正の独立再確認

関連3ファイルを再実行し43/43成功、exit0。追加actual DOMテストはdElem='100'等の手入力を通しdamage().e=10を確認する。null/undefined/空文字/空白/boolean/非数値文字列は拒否し、文字列100でもelementKnown=falseなら拒否を維持する。damageFromParamsの数値文字列parseは数値式の変更ではない。以前のP1は解消確認済み。

本レビューで指摘した3破損境界、4公開入口/属性報告境界、手入力P1はすべて現在の回帰で解消。残存blocking findingなし。ただし全suite QA・既存fixture互換の最終結果はQA担当実行中であり、この43件の結果と区別する。最終全QA後の確認依頼を待つ。

## 最終追加3契約・fixture独立レビュー

関連3testファイルを新規実行し46/46成功、exit0。groupProposal実経路で取得時baseStatsを候補へdeepcopy伝播、nested statsをcomparisonDpsValueへ供給する変更と回帰が整合する。unknown候補は脱落/0化させずdamage=null/reasonを保持し表示を保留。既知属性の表示丸めはコピーだけで行い計算state精度を変更しない。旧P1の手入力回帰も継続成功。製品blocking findingを新たに認めない。

fixture監査60件の記録ではassert59件不変、1件はraw参照検査を維持したpending guard regex追加。test名/skip数は全件不変。before archiveとr192/r139/expanded-combo差分を独立標本確認し、実production module/helper登録・合成既知属性state・baseStats追加は新しい属性契約を与える初期化として妥当。数値期待値の変更は標本に無し。

監査after SHAを現ファイルへ照合すると59件一致、expanded-combo-domの1件だけ不一致。現差分はbaseStatsの追加を含むfixture初期化のみでassert数値/順序期待を維持しており製品blockingではないが、監査JSONが最終変更に追随していないP2報告整合としてrootへ再生成依頼済み。

/private/tmp/kan19-20-regression-DDQwJ1直下の最終QA logsを読み、Node798/798、DOM308/308、Browser77/77、smoke16/16、legacy11/11、template6/6、各fail0/skip0を確認。これはQA担当の隔離実行ログの読取確認であり、本担当が全suiteを再実行した主張ではない。本担当の新規実行は上記46件。最終fixture SHA監査更新後、レビュー指摘で残るblockingは無し。

### ヒンメルによる監査整合の修正確認

独立review指摘のexpanded-combo-domの監査SHAを最終baseStats fixture版へ更新。変更前archiveとassert一致を機械確認し、全60監査SHAが現ファイルと一致。製品コード変更はなく、最終テストコピーとの内容一致も確認済み。
