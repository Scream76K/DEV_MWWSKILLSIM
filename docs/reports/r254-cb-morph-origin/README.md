> 後続: オーナー00:35の通常ビン1本消費承認により、明示開始条件付きEDⅠ単独はr255-cb-ed1-stateで接続。下記はその前段の保護修正履歴。

# 条件付き高速変形：派生元不明の誤正常値を拒否

基点 ab7ac965c0132f717470521cfa9b2ae52c121725。承認済み https://kuroyonhon.com/mhwilds/memo/26.php の条件付き対象を調査。今回は「条件成立の計算接続」には到達せず、「不明を非成立とみなす誤正常値」を修正した。

## 成立を阻む具体箇所

- index.html:3958の実選択CB一覧にチャージ/ガードの前段アクションがない。溜め斬り系をチャージ（ビン装填）として代用しない。
- min8/real-technique-one-hit-adapter.cjs:51付近は各Hitをevents.push({type:'hit',components})へ変換。phialReferenceは命中本数の成分生成で、残弾消費イベントではない。
- min8/real-one-hit-pipeline.cjs:87-88はHandlerのevent.type!='hit'を拒否する。engine.cjs:194以降の共通consume/状態変更機能は存在するが、この製品入口のCB Adapter/Handlerへ接続されていない。
- Adapter initialStateは空オブジェクト。状態条件は共通入力を読むだけで、前段が実行された証拠を生成しない。盾突き→AEDも前段Hitの順番だけではガード/チャージ由来・残弾を確定できない。

従って既存列に前段名を置く、UIで「派生あり」とチェックするだけでは本依頼の受入を満たさない。source gate/Hit数/残弾を推測解除しない。

## 限定修正・実証

Adapterで高速変形Lv2/3かつCB_ELEMENT_DISCHARGE_1 / CB_AED / CB_SAED / CB_SAED_AED_DERIVEDは CB_RAPID_MORPH_ORIGIN_UNRESOLVED:<id>。この一覧は「全て無条件に倍率対象」とする一覧ではなく、派生元解決が必要な保留範囲。Lv0/1は威力倍率差がないので従来算出を維持。成立/明示的非成立の入力契約は未実装であり、不明をfalse補完しない。

製品commit 0ef3ede9ae361af1d61fe29b6e258c9d73c1481b。
比較表示commit / 実行SHA 508e25878efef2f81bfd7dbcde5a7b295af69d7f。
比較の汎用メッセージに埋もれていた派生元不明を日本語で明示。

tools/cb-morph-origin-proof.cjsは既保存原典CB147＋合法slot3の珠46のみ使用。実calcBuild→saveNamedBuild→runBuildCompare、通常/最大を確認。Lv0は167.75、Lv3は未算出。A/Bで片側167.75を保ち片側未算出、比較終了後snapshot/条件/real結果が復元。集計値上書きなし。before.jsonは旧Adapter ab7ac965をgit showで置換し同入力が誤ってOKになる反例（HTMLは508e258）。after.jsonは508e258全体で成功。before-render-reason.jsonは理由データが比較表示に明示されなかった最初の失敗を保持。

前回r254-rapid-morph-attack-stageのED Iを「非対象」とした表現・対照は派生元不明を無視しており撤回する。剣変形・SAの数値証拠はその実行SHAにおける履歴として保持。旧検証器を現行HEADの成功証拠としない。今回は既確認変形威力の反復・全体回帰は実行していない。

## 次の最小候補

1. CBチャージ→ED I：前段チャージの非ダメージイベント、初期ビンと装填/消費の出典付き契約が必要。UI由来の単なるboolではなく共通イベントの実行状態から派生元を渡す。現在の情報だけでは実装成立不可。
2. 独立候補SA_AXE_SWEEP_MORPH：4HitデータはあるがPARTIALLY_VERIFIED/EVIDENCE_GATED。高速変形の対象承認は技自体のgate解除承認ではない。各Hit攻撃mode/ビン対象・ゲート未達を照合して限定採用可否を整理する候補。
3. 既に算出可能なSA_SWORD_MORPH_DOUBLE / SA_AXE_MORPH_SLASH以外の変形技は同様のgateを持つ。新規の確定済み成功経路を発見したとは報告しない。

コード・文書のローカルcommitのみ。push/merge/公開なし。全14武器や条件付き派生の完成ではない。
