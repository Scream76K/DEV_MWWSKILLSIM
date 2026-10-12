# KAN-23 / KAN-24確認：狩猟笛本体の限定P0接続

2026-10-11。r250開発中、未コミット。/Users/scream/Projects/DEV_MWWSKILLSIM-r250、codex/integrate-r249、HEAD fb6d82cd525da9273af10ac6b719f330208608c5。開始時index.htmlは/private/tmp/kan23-before.htmlに保全。原本変更・commit・push・merge・公開・Jira編集なし。

## 指示確認と優先対象

KAN-23 #10079/10080/10081を直接読取。KAN-24はコメント0件、課題本文を取得して属性弾のHit/event・弾Lv・射撃方式・成分・装填／距離条件を確認する指示を確認。
狩猟笛資料 https://kuroyonhon.com/mhwilds/memo/8.php#6 とガンランス一次資料 https://kuroyonhon.com/mhwilds/memo/10.php を開いて参照。今回の実装値は既存DBのみ。新しい外部値の採用なし。GameWithの補助照合・GL全Hitの網羅検証は今回未実施。

|対象|既存接続・不足|優先判断|
|---|---|---|
|狩猟笛|左・前方の本体は既存接続。右・後方の本体もMV/Hit/属性補正が揃う。音波・響玉のsource estimateはあるが完全STANDARDのイベント型／回数等が未接続|本体4技を状態限定で3経路へ接続|
|ガンランス|砲撃なしの2技は接続済み。ユーザー提示Hit数はあるが、砲撃種別係数・竜杭成分型・会心／肉質条件・連装補正の適用範囲を既存Handlerが解決できない|既存打撃を維持。特殊成分は今回未実装|
|LBG|共有弾表に資料値はあるが、属性弾・速射のHit/event全体、武器適用、物理／属性の完全な成分経路が未接続|HBGの式を無条件に流用せず保留|

Hit構成資料だけで不足係数や状態を0補完しない。GLの約Hit数を確定値にしない。猟虫の新規数値採用は保留を維持。

## 実装した範囲

単発：HH_LEFT_SWING（左ぶん回し）、HH_FORWARD_ATTACK（前方攻撃）、HH_RIGHT_SWING（右ぶん回し）、HH_BACKWARD_ATTACK（後方攻撃）。
参考テンプレ：adopted:hh_body_reference、左ぶん回し→前方攻撃（響玉・旋律強化なし／参考）。
自由コンボ：本体4技の任意順・反復。全段が算出可能な場合のみ合計。

左・前方は既存VERIFIEDレコード（validFromVersion 1.040.00、MACARONGAMEMO_HH_MOTION）。右・後方はSOURCE_CONFIRMED/PARTIALLY_VERIFIED、baselineGameVersion 1.042.00.02、MACARONGAMEMO_HH_R48_SOURCE、正式calculationStatusはEVIDENCE_GATEDのまま。右・後方の数値・属性補正を新規作成せずDBから読む。部位耐久補正をHPへ掛けない。柄攻撃は成分型保留、叩きつけ・追撃は前提動作／全技Hit構成の整理が必要なため今回対象外。

HuntingHornBodyHandlerは新しい数式ではなく状態確認アダプター。既存ordinaryComboTechniqueDamage→genericProfileDamageを再利用。現在の装備・超会心・会心条件・属性・肉質・斬れ味をP0共通入力から取得。正式HuntingHornHandlerの複合演奏ルートを完成／VERIFIEDへ昇格させない。

## 特殊成分・状態の扱い

響玉追撃なし、旋律の攻撃／属性強化なしを明示選択したときだけP0本体を算出。未選択・響玉あり・旋律強化ありは理由付き未算出。旧hh_left/hh_forward IDからP0へ入っても同じ状態確認を通し、ガードを迂回しない。
演奏・音波・響玉・重ね掛けなどが含まれる未接続技を混ぜた場合は全体未算出。本体部分だけを完全な総ダメージとしない。既存huntingHornSpecialSourceEstimateは成分試算であり、イベント数を推測して総計へ加えない。

## JSON・保存比較・既存機能保全

combo.huntingHornState（echoState/melodyState）を追加。既存キー/versionを維持。状態のない旧JSONは不明として復元し、勝手になしへ変換しない。共通比較条件へ伝播し復元。P0計算後の保存復元も回帰確認。
Technique DB領域は開始時と完全一致。操虫棍2技、ガンランス、弓・HBG・SAED、KAN-13/19/21、既存保存比較の回帰を実行。猟虫新規数値・MHDB外係数・DPS・時間データ変更なし。

## 変更ファイル

- index.html：本体4技とテンプレ、状態確認アダプター、響玉／旋律条件UI、保存・比較条件伝播。
- tools/kan23-hh-p0-dom.test.cjs：追加5件。
- tools/kan23-hh-p0-browser.test.cjs：追加2件（375/1440px）。
- tools/canonical-presets-dom.test.cjs：旧HH未接続前提を対象限定で更新し、正確な技列・条件・Handlerを追加1件で検証。
- tools/expanded-combo-dom.test.cjs：専用状態確認アダプターを普通技から区別、DB由来・特殊成分なしを確認。
- tools/canonical-timing-dom.test.cjs：従来25対象＋新しいHH4技で29対象へ更新。既存の各技Hit不変検証を維持。これは既存テストの対象増加であり実ゲーム時間計測・DPS開発ではない。
- docs/reports/kan-23/：報告・ログ・差分・画面画像。

## テスト結果

|対象|実行/合格|失敗|skip|
|---|---:|---:|---:|
|Node|830|0|0|
|DOM|353|0|0|
|Browser・保存・テンプレ・旧OCR|127|0|0|
|合計|1310|0|0|

REDで未接続を確認、GREEN5件。4技単発、テンプレ／自由の一致、状態不明と演奏混入で合計保留、旧技IDからの迂回禁止、装備会心肉質更新、状態・反復・JSON復元を確認。Chromium375/1440pxで3操作・保存復元・横はみ出し／pageerrorなし。375px画像を目視確認。Safari実機・独立担当レビューは未実施。git diff --check合格。テスト削除・skip・無条件期待値緩和なし。

## 残課題とゼーリエへのレビュー依頼

狩猟笛の限定本体4技の3経路接続を採用候補として提示。演奏音波・響玉・旋律強化はイベント型／回数／状態条件の対応が必要。ガンランス特殊成分とLBG属性弾の完全なHit/event解決は未完了。CBのSAED以外も保留。次工程はこれらの不足条件の採否判断と既存Handler接続単位の決定。

Jira転記用：KAN-23の本体4技を、響玉・旋律強化なし条件で単発／参考テンプレ／自由コンボへ接続。既存共通式とDBのみを使用。1310件合格、失敗skip0。既存JSON・KAN-13/19/21・操虫棍限定機能を保全。GL砲撃／竜杭・LBG属性弾・HH特殊成分は理由付き未算出。Git更新・公開なし。
