# CB R四技 公開プリセット接続（レビュー待ち）

既存CHARGE_BLADE_STANDARD_PROFILES.RELEASE_ROUTEの技ID列を参照する公開プリセット `adopted:cb_release_r` のみ追加。数値・consumer・状態補完・混合許可は変更していない。名前に「混合基準の片側・開始状態を明示」と表示。既存SAED参考を保持する。技DB ID存在を確認して選択可能にするが、旧move calculationBlockedラベルを計算許可とは扱わず、既存公開Pipelineの成分/状態検証に委ねる。旧単体/時間算出の制約を解除していない。

## 採用根拠と計画

固定5ac4382のSTAGE2_ACCEPTANCE、r262-cb-ed1-half/README末尾の4解放列受入でR各本体・斧追加・ビン・消費が採用済み。profile既存4IDを公開選択→保存JSON→calcBuildへ渡すだけの修正。H盾突き爆発とR/H時間比合成は対象外。旧目標/10/4/10/5履歴はBASELINE_TARGET_V10_RECONCILIATIONに保持。

## 公開最小実行

JSDOM、回収実MHDB hash9491bfc1…0c810、KOTATU_CB_01の装備を変更せず、テンプレDOMボタン→新presetのchangeイベント→calcBuild→2保存→読込→共有比較。技ID列4本をassert。盾ON/斧ON/榴弾、前段CHARGE、通常ビン2/強化0を明示。黒蝕OVERCOME、トレモ前面。同内容2保存で異装備比較ではない。

- RED: preset不存在、exit1。
- 初回修正:旧moveのcalculationBlockedによりpreset非表示、exit1。旧metadataを既存採用Pipelineの可否と混同していたため表示条件のみ是正。診断ログ保持。
- 元条件 通常152OFF/最大ON: 通常2200.5296、ビン0・前段FOLLOWUPまで完了。最大ATTRIBUTE_CONVERSION_BODY_SCOPE_UNSUPPORTEDで開始状態のまま停止。2保存読込/共有比較と保存内容・条件不変のassertまで通過、その後complete期待assertが失敗(exit1)。原代表成立としない。
- 対照条件 152両側OFF: 通常2200.5296、最大2622.1756。両側完了・ビン2→0、保存2件/読込/共有比較/現在入力・保存内容不変。開始ビン1.5の不足対照は両側incompleteで総計を出さない。exit0。

## 残件・制限

現MHAttributeConversionMixedScope.impactTechniqueIdsはCB_AEDのみ。Rに含むED1/ED2/FOLLOWUPの152混合適用が表にない。今回ガードは拡張せず、必要な範囲採否/既存承認との照合へ返す。OFF対照は元最大ONの成功代替ではない。R成功もミックス完成ではない。

実機/Safari/F01故障注入/全回帰/別ビン型・別斧状態は今回未実行。実行時ごとのhashは生JSON、最終hashはmanifest。index以外の製品変更なし。commit/pushなし。ローカル .agents/skills は当該checkoutに存在せず、既存実DB公開ハーネスと受入手順を再利用。


## 独立受入

review01a19527-8d38-7762-80fe-f8aea9620868でR公開プリセット限定受入可・必須修正なし。上記最大ON停止は後続CB_R_152_REPORT.mdで是正し、旧ログは変更前証拠として保持。
