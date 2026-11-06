# CB標準計算の入力要求・一次調査

現行HTML SHA256 `c4389b60955ce8de585290fa1b07f12cab59bceac28bc87ff6d18f27badc3a8c`。既存未コミット成果を維持。この調査では製品コード/保存データを変更していない。

## 発生源と画面

index.html末尾 `zeerie-consumer-combat-controls` が `comboCBStatePanel` をコンボ詳細から `consumerCBConditions` として比較ボタンの直前へ移す。常時表示される案内は「R解放ループを選び、評価方式をR/H各1回の独立合算に設定」「開始状態を指定し保存し直す」。`sync()` はCB/HH/GLの共通詳細を毎click/changeで強制openする。このため閉じたままの簡便な通常利用にも不向き。

CBパネルの14入力:

|入力|現在の扱い|標準計算としての問題|
|---|---|---|
|評価方式|明示技列で有効。技列空の場合はconsumerStandardProfileがR_H_INDEPENDENTを上書き|標準利用者に同じ選択を再要求する案内が誤り|
|R開始モード|AXE必須|固定経路の前提を利用者入力にしている|
|R直前行動|R初手の前提が必要（代表ケースCHARGE）|同上|
|R通常ビン数/強化ビン数|非負半本単位、技列消費量を満たす必要|最大装填の標準規約が未接続|
|H開始モード|AXE必須|独立開始をコード生成せず入力させる|
|H直前行動|AXE_NEUTRAL必須|固定前提を入力させる|
|H通常ビン数/強化ビン数|Hは強化0のみ受理、通常残数を消費|赤/強化最大の標準と照合が必要|
|剣強化|Hはfalse必須|固定前提を入力させる|
|盾強化|Hはtrue必須|固定前提を入力させる|
|斧強化|boolean必須、消費量0.5/1へ影響|採用標準の状態を生成すべき|
|ビン種|HはIMPACTのみ、武器DBとも照合|武器に属する情報を二重入力。画面の「榴弾未接続」表記も既存H榴弾経路と不一致|
|ビン強化段階|Hはfalse必須|最大赤ビンとの意味対応が未解決|

HTML required属性の有無と、計算成立に必要な条件は異なる。未入力を処理できないのは `hope-hammer-browser-adapter.js` のH検証（CB_H_EXPLICIT_MODE_SHIELD_SWORD_REQUIRED、CB_H_NORMAL_PHIAL_ONLY）および解放技列resource planning。`consumerEvaluationPlan` は標準時にmixModeだけ補い、他の条件は空のUIから引き継ぐ。

## 確定事項と未解決の対応

最新ユーザー指示は「気軽に使える」「こだわる利用者だけコンボ形成」「CB赤ビン最大装填、R/H各独立開始、丸め前実ダメージ単純加算」。R/H独立加算はKAN-21現行本文でも明記されている。

KAN-21コメント10057はストック上限5本、黄色ゲージ装填3本、赤ゲージ装填5本、砲弾装填Lv2は黄色でも5本（上限は増加しない）と記録。一方コメント10059はビン種（榴弾/強属性）とビン強化状態（通常/強化）を別軸と明記。SAED参考コードには砲弾装填Lv2未満で強化3＋通常2、Lv2で強化5という別モデルが存在する。

従って「赤ゲージ装填5本」を自動的に「強化ビン5本」と読み替えたり、SAED専用の強化3＋通常2モデルをR/Hへ無条件転用できない。現行Hガードは強化0・榴弾のみであり、前回成立した代表テストも通常2/強化0だった。前回のCB成立は最大赤ビン標準への適合証拠ではない。

参照: https://harasworkspace-36774503.atlassian.net/browse/KAN-21 （本文、コメント10057/10059）、KAN-108本文（DPS廃止、固定コンボと通常/最大独立）。公開資料を今回新規に実測確認してはいない。

## 具体的修正方針

1. 共通の標準評価条件producerで、技列未指定時は確定済みの標準状態を生成。現在・保存A/Bで同じproducerを使用し、ユーザーが保存した個別コンボや条件は上書きしない。
2. CBではビン種を実武器DBから読み、標準R/Hの別オブジェクトへ独立開始状態を生成。赤ビンの意味と装填内訳を根拠に確定した後、既存DB係数/リソース処理へ渡す。強化ビンを採用する場合、H_NORMAL_PHIAL_ONLYを単に消さず、盾突き成分・後続AEDの状態/係数の適用範囲を検証する。
3. 通常画面は標準条件の短い説明と比較操作を主体にする。開始形態・直前行動・残数等は「コンボを調整する」詳細へ移す。共通詳細の強制openも除き、利用者が開閉できるようにする。単に入力欄を隠して未算出を残す対応はしない。
4. 空条件からCB標準現在計算→異装備A/B保存比較→復元、R/H独立状態と丸め前加算、通常/最大独立、旧明示コンボ保持を最小確認。共通UIを変えた場合は他武器の詳細開閉/標準適用範囲も確認。

## 親への判断事項

確定したいのは新しいゲーム係数ではなく、指示の「赤ビン最大」が (a) 赤ゲージから装填した5本のストック、(b) 強化ビンを最大化したストック、のどちらを指すか、および砲弾装填Lv別の内訳をR/Hへ適用する既決記録。現行限定Hとの矛盾を解消する必要がある。今回読めた記録だけで一方に決めて製品を変更しない。

Safari本体の操作・入力変更はしていない。配信中ソースを調査したもので、Safari描画の新規実機確認ではない。コード未変更のため同じ回帰を再実行していない。commit/pushなし。

## 追加照合・共通UI修正と全14武器の未入力監査

KAN-21コメント10056/10057/10059/10063を再取得。赤ゲージ5本と強化段階の分離、強属性SAED限定採用を再確認。`r253-saed-loading/REPORT.md`、`r253-kan21-reference/REPORT.md`、`NIGHT_HANDOFF_2026-10-25.md`、`tests/flamme-cb-saed-mixed-phials.test.cjs` は砲弾装填Lv0/1=強化3+通常2、Lv2=強化5という **SAED限定モデル** を裏付ける。R/H開始へこのモデルを転用する採用記録は今回も見つからない。過去CB_MIX/H/R公開受入は通常2/強化0の限定入力だった。

安全な共通UI変更を実施:
- consumerWeaponConditionsのsyncから毎click/changeのopen強制代入を除去。閉じた状態/開いた状態を利用者が保持できる。
- 共通説明を「技を追加しなければ基準コンボ、調整するとき詳細を開く」へ修正。
- CBの誤った「Rプリセットと独立合算方式を必ず選ぶ」案内を撤去。ただし標準開始条件が未接続であることは隠さない。入力そのものを隠して成功とみなしていない。

`tools/details-toggle-regression.cjs` はCB/HH/GLについてopen/closedの双方をchange/click後に保持することを隔離JSDOMで確認。`../evidence/details-toggle.json`。UI契約・保存所有権の既存テストも成功（`../evidence/details-ui-tests.txt`）。数値・DB・adapter変更なし。

全14武器を `tools/standard-no-input-audit.cjs` で再現。捕捉済み実MHDBテンプレート、訓練対象前面、空の技列・武器条件・追加発動条件、A保存→頭防具除去B保存→比較を通した。状態/保存内容不変と現在/比較結果一致は全14で確認。ただし通常/最大の両方がavailableになるケースは0/14。これは実機の全入力を再現したという意味ではなく「条件を入力させない」利用の検証。

|代表武器|最初の停止原因|
|---|---|
|GS/SNS/HAM/LAN/IG/BOW|ATTRIBUTE_CONVERSION_STATE_REQUIRED|
|LS|通常BLACK_ECLIPSE_NORMAL_STATE_REQUIRED、最大spiritGauge不一致|
|DB|通常BLACK_ECLIPSE_NORMAL_STATE_REQUIRED、最大requiresDemonGauge不一致|
|HH|SPECIAL_ROUTE_PENDING（旋律モデル未選択）|
|GL|GL_TARGET:SOURCE_POWER_PENDING（砲撃種/威力未入力）|
|SA|STATE_REQUIREMENT_UNRESOLVED:mode|
|CB|R/H両方CB_MIX_EXPLICIT_AXE_START_REQUIRED|
|LBG|ARTIA_CAPACITY_AMMO_SCOPE_PENDING|
|HBG|HBG_ELEMENT:WEAPON_AMMO_UNRESOLVED|

証拠: `../evidence/standard-no-input-audit.json`。前回の14武器成立は明示条件付きであり、今回要求の標準利用成立とは区別する。特にハンマーは計算式欠落ではなく条件producerの接続欠落が再現した。親の独立GL調査では武器1151の攻撃/会心激化にARTIA_COMPLETED_VALUES_UNRESOLVED、属性激化時は空砲撃条件でSOURCE_POWER_PENDING。HBG1094も空弾条件。これらは追加調査結果として受領し、現オーナー実入力と同一とは断定しない。

ブラウザー回帰では、条件欄開閉の途中で武器kindをCBへ変えた後の武器選択が空になり、CBパネル非表示となる症状が出て完走していない。詳細DOM診断はselectedWeapon未選択を示した。テスト側選択手順/製品側再描画をまだ切り分けていないため、Chromium成功扱いにしない。既存成功JSON/画像は今回の失敗で無効になったと断定せず、対象hashと実行範囲を区別。今回実機受入はなし。

残作業は共通標準条件producerの実装（武器DB由来の値、採用済み開始条件、通常/最大の固定スキルシナリオを分離）、GL激化属性の根拠接続、弾/旋律/CB強化開始の採用契約の照合。詳細欄変更だけではこの作業は完了していない。ユーザーへの追加実機操作要求なし、commit/pushなし。
