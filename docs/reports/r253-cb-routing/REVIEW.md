# CB混在選択の式登録修正

基点c400e38ac356491d23fa23a0a1f397bf74d6b1c6。成果は式ルーティング修正のみ。実コンボ計算成立ではない。

## 現存確認

hope-hammer-browser-adapter.jsはresolvedTechniqueIds.every(reference)をreferenceFormula登録条件としていた。実MHDB103でUIからCB_ELEMENT_DISCHARGE_1/CB_SAEDを選ぶと、physical/phial式は登録されるがreference式は未登録。一方単独SAEDでは登録される。

公開経路ではこの後、real-technique-one-hit-adapter.cjsのnumericStatus SOURCE_CONFIRMED要求がSAEDでREFERENCE_SOURCE_PENDINGを返す。そのため現状で実際に表面化するのは出典ゲートであり、式未登録エラーではない。ゲートの解除・出典状態の書換えはしていない。

## 最小変更

- reference成分が1つでもあればhasReferenceで式登録。通常physical/element/phialと同じ共通Pipelineに共存する。
- 肉質種の列集約はreference技を除いた通常技だけから解決する。reference技は自身の式で肉質を解決する。
- CB SAED参照式は複数選択の場合CB_SEQUENCE_STATE_TRANSITION_UNRESOLVEDを返す。静的な共通盾/斧状態や満装填状態を、先行技後の状態と見なさない。先行通常技の部分値をコンボ合計として採用しない。
- ソース・係数・ビン命中数・消費数・表示方針・bundleの変更なし。新しい状態遷移の創作なし。

## 最小証拠

tools/cb-mixed-routing-proof.cjs。既存CB103原典fixtureから武器だけ使用、装飾品/防具なし。盾ON/斧OFF/強属性/強化ビン。UIから混在列と単独SAEDを選択してcalcBuild。

検証器はHimmelRealOneHitPipelineを観測ラッパーで包み、登録された式の型を記録した直後に同じ引数を元関数へ渡す。stats/skills/plan/出典/戻り値は変更せず、式やrendererのスタブなし。

before.json: 混在referenceRegistered=false、physical/phial=true。単独reference=true。
result.json: 混在・単独ともreference/physical/phial=true。公開結果は双方REFERENCE_SOURCE_PENDINGのまま。数値合計の成立は主張しない。新しい連続状態保留への実到達は先行出典ゲートに阻まれるため静的確認のみ。

既存SAEDはfull-five-phial/full-hitの限定参照契約。消費5と爆発命中5を一般的に同一視しない。先行解放Ⅰの消費後にSAEDを満装填5命中として単純加算できる証拠はない。残弾、再装填、盾/斧遷移の定義が揃うまで混在実コンボは未完。

初期ハーネスでは混在状態保留/単独completeを期待していたが、実読取で先行REFERENCE_SOURCE_PENDINGを発見。出典ゲートを変更せず、今回対象である登録差を直接観測する期待へ訂正した。数値期待の緩和や製品ゲート解除ではない。
