> 後続変更：時間概念は2026-11-01 13:23の承認で廃止。現在のミックスは [CB_INDEPENDENT_MIX_REPORT.md](CB_INDEPENDENT_MIX_REPORT.md) の独立各1回単純合算。本書の時間残件は当時の履歴であり再要求しない。

# CB H限定接続 — 独立レビュー限定受入

2026-11-01承認 `Sentinel_b0338f54b160819183484aed19d41354`。本件はH片側の実ダメージ計算であり、R/H時間比ミックスや④全体の完成ではない。

## 採用範囲と実装

H公開プリセットを `CB_AXE_TO_SWORD_MORPH → CB_SHIELD_THRUST → CB_AED → CB_FOLLOWUP_AED` へ是正。先頭は既存MV30/属性1・切断・高速変形対象、AXE→SWORD。逆方向の斧強化追加4Hitは生成しない。盾突きは盾強化あり・剣強化なし・公式榴弾、本体2Hit＋爆発1回、内部消費0の限定暫定。既存本体MV15/6・属性各1・既存榴弾係数を保持。

Technique DB採用recordに旧record、承認、出典、版未確定、直接成分/資源未検証を保持。状態UIに開始形態と剣強化の未選択/明示値を追加し、旧保存欠損を補完しない。全H列の一致、AXE開始、AXE_NEUTRAL前段、盾ON/剣OFF、榴弾、通常ビンのみを検証。盾突きまでSWORD、AED以降AXEへ既存共通イベントで遷移。任意列・反復・他ビンは解禁しない。元の汎用盾突き未確定記録は履歴/未採用汎用範囲として保持。

152は本体/追加属性へ一回、榴弾非適用を保持。既存Rの数値・消費を変更しない。

## 根拠と確度

[採否資料](CB_H_SHIELD_AND_MIX_DECISION.md)、[CB1追補](cb1-shield-limited/approved-readout.log)、独立画像確認 `01a19546-718c-7040-8f31-22825d3b8920`。操作資料 https://kuroyonhon.com/mhwilds/memo/12.php と既存Technique DBを使用。CB1の+3Hitと方向は支持材料。映像から本体/爆発を完全分離した、または内部消費0を実測確定したとは扱わない。今回の追加範囲はOWNER_APPROVED_PROVISIONAL、正確ゲーム版・実機確認は未確定。

## 公開経路の最小検証

`node tools/stage4-cb-h-public-proof.cjs`、回収MHDB hash `9491bfc1cf357aed4967418949d78c0ddd73407c6461443a7b594a2b2710c810`、JSDOM上の実テンプレ読込ボタン→H公開プリセット→calcBuild。合成装備なし。原動画コンボ実測ではない。

KOTATU_CB_01装備維持、training-room/front、黒蝕OVERCOME、通常152OFF/最大ON。盾ON・斧ON・剣OFF、通常ビン2/強化0、AXE/AXE_NEUTRAL開始。全H列・本体両Hit命中の契約。

| 対照 | 期待 | 実出力 |
|---|---|---|
| H元条件 | 両channel完遂 | 通常1385.4835000000003 / 最大1678.9035000000003 |
| 最大152OFF | 通常不変、対象属性のみ差 | 最大1637.8535000000002、13属性へ+180一回・他16成分不変 |
| H状態/消費 | prefix0、AED/追撃各0.5、2→1 | 両channel最終AXE/CB_FOLLOWUP_AED/ビン1 |
| morph/盾突き | morph本体1のみ、盾本体2＋爆発1 | 物理/属性2成分、盾5成分（2物理/2属性/1榴弾） |
| 状態境界 | 欠損mode/逆mode/剣未知/剣ON/盾OFF/強属性は停止 | 6例とも理由付き停止 |
| ビン不足0.5 | 部分総計を成功扱いしない | 両channel未完遂 |
| 同内容2保存 | 読込同値・共有比較同値・内容条件不変 | PASS（異装備A/Bではない） |
| R近傍 | 既受入数値不変 | 通常2200.5296000000008 / 最大2678.2256 |

`final.json`/`r-nearby.json` exit0。finalは状態境界を追加した最終ハーネス。attempt6は先行成功ログでありfinalハーネスとは別hash。

## 失敗履歴・差分・未実施

`red.json` exit1=変更前Hプリセットなし。attempt1=プリセット配列余剰comma、attempt2=verification保留と二次ハーネス参照エラー、attempt3=開始mode未伝搬、attempt4=遷移定義不足、attempt5=遷移operations不整合。いずれも保存し、最終成功に上書きしない。attempt6/final/R exit0。JSON内failureと製品停止は別扱い。

[差分](cb-h-connection/incremental.patch)、[全hash/exit](cb-h-connection/manifest.json)、[最終生出力](cb-h-connection/final.json)、[R生出力](cb-h-connection/r-nearby.json)。bundleは変更した既存モジュールから再生成。既存未commit成果を含む製品hashと、本件baseline差分を区別。

実機/Safari/全回帰/F01故障注入、強属性/強化ビン/剣強化/任意反復、時間TR/TH・DPS・R/Hミックスは未実施/未採用。本実行の不足ビン停止をF01全境界実証とはしない。commit/push/統合なし。元CB1動画hash不変。

## 独立受入記録

01a19553-e2e8-77f7-9f1f-9f3923e4e288：限定受入可・必須修正なし。5製品ファイルとbundle整合、H1385.4835/1678.9035、OFF1637.8535、R2200.5296/2678.2256、同内容2保存、6状態境界/ビン不足停止を今回の限定証拠として受入。旧失敗ログ・暫定性・未実施範囲は上記のまま。今回追記は文書のみ、追加試験なし、manifestの製品hash不変。
