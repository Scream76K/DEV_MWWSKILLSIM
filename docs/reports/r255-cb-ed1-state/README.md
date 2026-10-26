# チャージ完了後開始→通常ビンEDⅠの最小接続

承認: 2026-10-26 00:35 UTC Sentinel_0e41b1370e348191b629f759852d578a、斧強化OFFのEDⅠは通常ビン1本消費。爆発命中数とは別定義。高速変形の攻撃段階契約は既存23:53承認と https://kuroyonhon.com/mhwilds/memo/26.php 。前段チャージからのEDⅠは https://kuroyonhon.com/mhwilds/memo/12.php の連携表。

実装/実行SHA: 4606e5136913f3b82c57c57e2357836404c73b69。
after.jsonはこのSHAのindex/Adapter/bundle SHA256付き成功証拠。initial.jsonは未commit途中の同入力成功（具体的残数不足表示の調整前）として保持。min8変更3モジュールの全文が生成bundleに含まれることを静的確認。

## 期待出力と結果

実MHDB CB147、速変珠III46（slot3）、既取得fixtureを再利用。盾ON/斧OFF/通常ビン、開始残数1。集計値・結果上書きなし。

| 入力 | 通常=最大 | 完了状態 |
|---|---|---|
| チャージ直後・高速変形なし | P122.96 E10.35 ビン29.52 合計162.83 | 通常ビン0、直前行動EDⅠ |
| チャージ直後・Lv3 | P147.56 E10.35 ビン29.52 合計187.43 | 同上 |
| 斧通常構え・Lv3 | P122.96 E10.35 ビン29.52 合計162.83 | 同上 |
| 直前行動未入力 | CB_ED1_START_STATE_UNRESOLVED | 未算出 |
| チャージ直後・残数0 | CB_ED1_PHIAL_STOCK_INSUFFICIENT | 未算出、Hit未実行、残数0維持 |

属性とビンは同値。高速変形effectは対象物理だけ1回。今回加算順は既存共通attack段階を利用（前回加算併用検証を反復しない）。実行はHit→consume→transitionの3イベント。consume量はMHCBED1ResourceRule.consumeNormalPhials、爆発命中数は従来phialReference.hitCount。数値の正本を混ぜない。

## 接続

UIの直前行動CHARGE/AXE_NEUTRAL/未確認、通常ビン残数をcomboCBStoredStateで保存。restoreComboCBStateを通常読込とrestoreStep5Snapshotで共有。初期状態は評価ごとに独立コピーし、HandlerにDOM参照なし。技完了後previousActionをCB_ELEMENT_DISCHARGE_1へ更新。UIの開始入力自体を残数0へ書き換えず、結果finalStateと表示に返す。

既存engineのconsume/transitionと厳密nextState照合を使用。共通engineへ追加したexcludedEffectIdsは、ビン成分からこの高速変形effectだけを除外するための明示契約。他の攻撃・砲術効果は維持。

通常読込は実DOMの保存B読込ボタンを実行し、意図的に変えた直前行動/残数が戻ることを確認。実saveNamedBuild/runBuildCompareでLv0/Lv3 A/Bと単独の通常/最大が一致。共通開始条件はpreserveCombo:trueを維持。比較後snapshot/共通条件/real結果が完全一致。単独表示は最終残数・前段状態、失敗時は具体理由を表示。

## 範囲

EDⅠ単独・通常ビン・斧強化OFFの明示開始状態に限定。複数技列はCB_ED1_SEQUENCE_SCOPE_UNCONNECTEDで拒否し、最初のCHARGEを後続へ再利用しない。チャージ自体の装填処理、強化ビン混在の消費順、ガード/AED/SAED派生は未実装。従来の開始条件なし・高速変形なしEDⅠ経路は互換のため保持し、残数追跡済みとは扱わない。通常ビン残数は非負整数を検証するが、最大保有数の新規契約は追加していない。

前工程r254-cb-morph-originのEDⅠ一律保留は本条件のみ解除。未知・非成立・不足の区別は保持。テスト追加は今回境界を識別するこの検証器のみ、全体回帰/既確認他武器は反復していない。ローカルcommitのみ、push/merge/公開なし。
